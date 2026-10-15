"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  INTERACTION_RADIUS,
  PICKUP,
  PLAYABLE_BOUND,
  PLAYER_RADIUS,
  PLAYER_SPEED,
} from "../../lib/game/city-config";
import { resolveCircle, type Collider } from "../../lib/game/collision";
import type { Destination, InteractionAction, Position } from "../../lib/game/types";
import PlayerCharacter, { type AnimState } from "./PlayerCharacter";

interface PlayerControllerProps {
  groupRef: RefObject<THREE.Group | null>;
  initialPosition: Position;
  deliveryDestination: Destination | null;
  colliders: readonly Collider[];
  shopOpen?: boolean;
  /** shared with the delivery markers so they can react without re-rendering */
  availableActionRef: RefObject<InteractionAction | null>;
  onPositionChange?: (position: Position) => void;
  onInteractionAvailable?: (action: InteractionAction | null) => void;
  onInteract?: (action: InteractionAction, position: Position) => void;
}

const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const REPORT_INTERVAL = 0.3;

/**
 * Input, movement, collision and interaction. All per-frame work happens in
 * refs inside useFrame, so React never re-renders while the player moves.
 */
export default function PlayerController({
  groupRef,
  initialPosition,
  deliveryDestination,
  colliders,
  shopOpen = false,
  availableActionRef,
  onPositionChange,
  onInteractionAvailable,
  onInteract,
}: PlayerControllerProps) {
  const keys = useRef<Set<string>>(new Set());
  const velocity = useRef({ x: 0, z: 0 });
  const scratch = useRef({ x: 0, z: 0 });
  const anim = useRef<AnimState>({ amount: 0, phase: 0 });
  const lastReport = useRef(0);
  const unreported = useRef(false);

  const interactRef = useRef(onInteract);
  const availableRef = useRef(onInteractionAvailable);
  const positionRef = useRef(onPositionChange);
  const destinationRef = useRef(deliveryDestination);
  const collidersRef = useRef(colliders);
  const shopOpenRef = useRef(shopOpen);
  useEffect(() => {
    shopOpenRef.current = shopOpen;
    if (shopOpen) keys.current.clear();
  }, [shopOpen]);

  useEffect(() => {
    interactRef.current = onInteract;
    availableRef.current = onInteractionAvailable;
    positionRef.current = onPositionChange;
    destinationRef.current = deliveryDestination;
    collidersRef.current = colliders;
  }, [onInteract, onInteractionAvailable, onPositionChange, deliveryDestination, colliders]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || shopOpenRef.current) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, button, [contenteditable=true]")) return;

      if (ARROWS.includes(event.key)) event.preventDefault();

      if (event.key.toLowerCase() === "e" && !event.repeat) {
        const player = groupRef.current;
        const action = availableActionRef.current;
        if (player && action) {
          interactRef.current?.(action, { x: player.position.x, y: 0, z: player.position.z });
        }
      }

      keys.current.add(event.key.toLowerCase());
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    const onBlur = () => keys.current.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [groupRef, availableActionRef]);

  useFrame((state, delta) => {
    const player = groupRef.current;
    if (!player) return;
    const dt = Math.min(delta, 0.05);

    /* input */
    const k = keys.current;
    let dx = 0;
    let dz = 0;
    if (!shopOpenRef.current && (k.has("w") || k.has("arrowup"))) dz -= 1;
    if (!shopOpenRef.current && (k.has("s") || k.has("arrowdown"))) dz += 1;
    if (!shopOpenRef.current && (k.has("a") || k.has("arrowleft"))) dx -= 1;
    if (!shopOpenRef.current && (k.has("d") || k.has("arrowright"))) dx += 1;

    const hasInput = dx !== 0 || dz !== 0;
    if (hasInput) {
      const length = Math.hypot(dx, dz);
      dx /= length;
      dz /= length;
    }

    /* smoothed velocity (frame-rate independent) */
    const vel = velocity.current;
    const blend = 1 - Math.exp(-(hasInput ? 14 : 18) * dt);
    vel.x += (dx * PLAYER_SPEED - vel.x) * blend;
    vel.z += (dz * PLAYER_SPEED - vel.z) * blend;
    if (shopOpenRef.current) { vel.x = 0; vel.z = 0; }

    /* move, clamp to the city, then slide along any colliders */
    const before = scratch.current;
    before.x = player.position.x;
    before.z = player.position.z;

    const next = {
      x: THREE.MathUtils.clamp(before.x + vel.x * dt, -PLAYABLE_BOUND, PLAYABLE_BOUND),
      z: THREE.MathUtils.clamp(before.z + vel.z * dt, -PLAYABLE_BOUND, PLAYABLE_BOUND),
    };
    resolveCircle(next, PLAYER_RADIUS, collidersRef.current);
    next.x = THREE.MathUtils.clamp(next.x, -PLAYABLE_BOUND, PLAYABLE_BOUND);
    next.z = THREE.MathUtils.clamp(next.z, -PLAYABLE_BOUND, PLAYABLE_BOUND);
    player.position.x = next.x;
    player.position.z = next.z;

    const actualSpeed = dt > 0 ? Math.hypot(next.x - before.x, next.z - before.z) / dt : 0;

    /* face the direction of travel */
    if (Math.hypot(vel.x, vel.z) > 0.4 && hasInput) {
      const targetYaw = Math.atan2(vel.x, vel.z); // model faces +z
      const diff =
        THREE.MathUtils.euclideanModulo(targetYaw - player.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      player.rotation.y += diff * (1 - Math.exp(-14 * dt));
    }

    /* walk cycle */
    const a = anim.current;
    a.amount = THREE.MathUtils.damp(a.amount, THREE.MathUtils.clamp(actualSpeed / PLAYER_SPEED, 0, 1), 10, dt);
    if (a.amount > 0.02) a.phase += dt * 12 * Math.max(a.amount, 0.35);

    /* backend position sync: throttled while moving, plus one report on stopping */
    const now = state.clock.elapsedTime;
    const report = positionRef.current;
    if (actualSpeed > 0.05) {
      if (report && now - lastReport.current > REPORT_INTERVAL) {
        lastReport.current = now;
        unreported.current = false;
        report({ x: player.position.x, y: 0, z: player.position.z });
      } else {
        unreported.current = true;
      }
    } else if (unreported.current) {
      unreported.current = false;
      lastReport.current = now;
      report?.({ x: player.position.x, y: 0, z: player.position.z });
    }

    /* interaction range, same rules as before */
    const destination = destinationRef.current;
    const target = destination ?? PICKUP;
    const distance = Math.hypot(player.position.x - target.x, player.position.z - target.z);
    // Adwoa's Provision Shop faces +z; entrance is just beyond its front wall.
    const shopDistance = Math.hypot(player.position.x + 11, player.position.z + 6.7);
    const action: InteractionAction | null = shopOpenRef.current
      ? null
      : shopDistance <= INTERACTION_RADIUS
        ? "shop"
        : distance <= INTERACTION_RADIUS
          ? (destination ? "complete" : "pickup")
          : null;

    if (availableActionRef.current !== action) {
      availableActionRef.current = action;
      availableRef.current?.(action);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[initialPosition.x, initialPosition.y, initialPosition.z]}
    >
      <group scale={1.1}>
        <PlayerCharacter anim={anim} />
      </group>
    </group>
  );
}
