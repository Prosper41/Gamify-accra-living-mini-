"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CAMERA_OFFSET,
  INTERACTION_RADIUS,
  PICKUP,
  PLAYER_RADIUS,
} from "../../lib/game/city-config";
import { STATIC_COLLIDERS, filterColliders, validateCityLayout } from "../../lib/game/collision";
import type { InteractionAction, Position } from "../../lib/game/types";
import CityEnvironment from "./CityEnvironment";
import DeliveryMarker from "./DeliveryMarker";
import FollowCamera from "./FollowCamera";
import Lighting from "./Lighting";
import PlayerController from "./PlayerController";

export type { Position } from "../../lib/game/types";

type CityWorldProps = {
  initialPosition?: Position;
  onPositionChange?: (position: Position) => void;
  deliveryDestination?: { x: number; z: number } | null;
  onInteractionAvailable?: (action: InteractionAction | null) => void;
  onInteract?: (action: InteractionAction, position: Position) => void;
  shopOpen?: boolean;
};

function CityScene({
  initialPosition,
  onPositionChange,
  deliveryDestination,
  onInteractionAvailable,
  onInteract,
  shopOpen,
}: CityWorldProps & { initialPosition: Position }) {
  const playerRef = useRef<THREE.Group>(null);
  const availableActionRef = useRef<InteractionAction | null>(null);

  const destX = deliveryDestination?.x;
  const destZ = deliveryDestination?.z;
  const destination = useMemo(
    () => (destX === undefined || destZ === undefined ? null : { x: destX, z: destZ }),
    [destX, destZ]
  );

  // Scenery near a delivery point is ignored for collision, so neither the
  // pickup nor any destination sent at runtime can ever be walled off.
  const colliders = useMemo(
    () =>
      filterColliders(
        STATIC_COLLIDERS,
        destination ? [PICKUP, destination] : [PICKUP],
        PLAYER_RADIUS + INTERACTION_RADIUS / 2
      ),
    [destination]
  );

  return (
    <>
      <Lighting />
      <CityEnvironment />

      <DeliveryMarker
        x={PICKUP.x}
        z={PICKUP.z}
        label="DELIVERY PICKUP"
        color="#f59e0b"
        variant="pickup"
        action="pickup"
        activeRef={availableActionRef}
        dimmed={destination !== null}
      />

      {destination && (
        <DeliveryMarker
          x={destination.x}
          z={destination.z}
          label="DELIVERY DESTINATION"
          color="#22c55e"
          variant="destination"
          action="complete"
          activeRef={availableActionRef}
        />
      )}

      {/* PlayerController must mount before FollowCamera so the camera reads the updated position */}
      <PlayerController
        groupRef={playerRef}
        initialPosition={initialPosition}
        deliveryDestination={destination}
        colliders={colliders}
        availableActionRef={availableActionRef}
        onPositionChange={onPositionChange}
        onInteractionAvailable={onInteractionAvailable}
        onInteract={onInteract}
        shopOpen={shopOpen}
      />
      <FollowCamera targetRef={playerRef} />
    </>
  );
}

export default function CityWorld({
  initialPosition = { x: 0, y: 0, z: 0 },
  onPositionChange,
  deliveryDestination = null,
  onInteractionAvailable,
  onInteract,
  shopOpen = false,
}: CityWorldProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const problems = validateCityLayout();
    if (problems.length > 0) console.warn("[CityWorld] layout problems:\n" + problems.join("\n"));
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{
        position: [
          initialPosition.x + CAMERA_OFFSET.x,
          CAMERA_OFFSET.y,
          initialPosition.z + CAMERA_OFFSET.z,
        ],
        fov: 50,
        near: 0.5,
        far: 400,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <CityScene
        initialPosition={initialPosition}
        onPositionChange={onPositionChange}
        deliveryDestination={deliveryDestination}
        onInteractionAvailable={onInteractionAvailable}
        onInteract={onInteract}
        shopOpen={shopOpen}
      />
    </Canvas>
  );
}
