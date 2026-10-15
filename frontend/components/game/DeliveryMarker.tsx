"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InteractionAction } from "../../lib/game/types";

interface DeliveryMarkerProps {
  x: number;
  z: number;
  label: string;
  color: string;
  variant: "pickup" | "destination";
  /** the action this marker triggers when the player is in range */
  action: InteractionAction;
  /** written by the player controller every frame; read here without re-rendering */
  activeRef: RefObject<InteractionAction | null>;
  /** shown quietly when the objective is not the current one */
  dimmed?: boolean;
}

const BEAM_GEOMETRY = new THREE.CylinderGeometry(0.9, 0.9, 9, 24, 1, true);
const CORE_GEOMETRY = new THREE.CylinderGeometry(0.05, 0.05, 9, 8);
const PAD_GEOMETRY = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 40);
const RING_GEOMETRY = new THREE.TorusGeometry(1.75, 0.07, 8, 48);
const WAVE_GEOMETRY = new THREE.RingGeometry(0.95, 1.05, 56);
const CRATE_GEOMETRY = new THREE.BoxGeometry(0.85, 0.85, 0.85);
const TAPE_GEOMETRY = new THREE.BoxGeometry(0.89, 0.12, 0.89);
const PIN_GEOMETRY = new THREE.ConeGeometry(0.5, 1.1, 20);
const PIN_HEAD_GEOMETRY = new THREE.SphereGeometry(0.5, 20, 14);

export default function DeliveryMarker({
  x,
  z,
  label,
  color,
  variant,
  action,
  activeRef,
  dimmed = false,
}: DeliveryMarkerProps) {
  const dimmedRef = useRef(dimmed);
  const amount = useRef(0);
  const ring = useRef<THREE.Mesh>(null);
  const wave = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Group>(null);
  const icon = useRef<THREE.Group>(null);
  const labelGroup = useRef<THREE.Group>(null);
  const prompt = useRef<THREE.Group>(null);

  const m = useMemo(
    () => ({
      pad: new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.5 }),
      ring: new THREE.MeshBasicMaterial({ color, toneMapped: false }),
      wave: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
      beam: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }),
      core: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }),
      icon: new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.4 }),
      tape: new THREE.MeshStandardMaterial({ color: "#fff7ed", roughness: 0.6 }),
      panel: new THREE.MeshBasicMaterial({ color: "#0f172a", transparent: true, opacity: 0.78, depthWrite: false }),
    }),
    [color]
  );

  useEffect(() => {
    dimmedRef.current = dimmed;
  }, [dimmed]);

  useEffect(() => () => Object.values(m).forEach((mat) => mat.dispose()), [m]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const active = activeRef.current === action;
    amount.current = THREE.MathUtils.damp(amount.current, active ? 1 : 0, 8, Math.min(delta, 0.1));
    const a = amount.current;
    const isDimmed = dimmedRef.current;

    m.pad.emissiveIntensity = (isDimmed ? 0.2 : 0.45) + a * 0.9 + Math.sin(t * 3) * 0.08;

    if (ring.current) {
      const s = 1 + Math.sin(t * 3) * 0.05 + a * 0.12;
      ring.current.scale.set(s, s, 1);
    }

    if (wave.current) {
      const phase = (t * 0.8) % 1;
      const s = 1 + phase * 1.5;
      wave.current.scale.set(s, s, 1);
      m.wave.opacity = (1 - phase) * ((isDimmed ? 0.18 : 0.4) + a * 0.3);
    }

    if (beam.current) {
      beam.current.visible = !isDimmed;
      m.beam.opacity = 0.14 + a * 0.12;
    }

    if (icon.current) {
      icon.current.visible = !isDimmed;
      icon.current.position.y = 3 + Math.sin(t * 2) * 0.22;
      icon.current.rotation.y = t * 1.2;
    }

    if (labelGroup.current) {
      const target = (isDimmed ? 0.7 : 1) + a * 0.12;
      labelGroup.current.scale.setScalar(THREE.MathUtils.damp(labelGroup.current.scale.x, target, 8, Math.min(delta, 0.1)));
    }

    if (prompt.current) {
      prompt.current.visible = a > 0.02;
      prompt.current.scale.setScalar(0.8 + 0.2 * a);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh geometry={PAD_GEOMETRY} material={m.pad} position={[0, 0.11, 0]} receiveShadow />
      <mesh ref={ring} geometry={RING_GEOMETRY} material={m.ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} />
      <mesh ref={wave} geometry={WAVE_GEOMETRY} material={m.wave} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]} />

      <group ref={beam}>
        <mesh geometry={BEAM_GEOMETRY} material={m.beam} position={[0, 4.5, 0]} />
        <mesh geometry={CORE_GEOMETRY} material={m.core} position={[0, 4.5, 0]} />
      </group>

      <group ref={icon} position={[0, 3, 0]}>
        {variant === "pickup" ? (
          <>
            <mesh geometry={CRATE_GEOMETRY} material={m.icon} castShadow />
            <mesh geometry={TAPE_GEOMETRY} material={m.tape} />
            <mesh geometry={TAPE_GEOMETRY} material={m.tape} rotation={[0, Math.PI / 2, 0]} />
          </>
        ) : (
          <>
            <mesh geometry={PIN_GEOMETRY} material={m.icon} position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]} castShadow />
            <mesh geometry={PIN_HEAD_GEOMETRY} material={m.icon} position={[0, 0.3, 0]} castShadow />
          </>
        )}
      </group>

      <Billboard position={[0, 5, 0]}>
        <group ref={labelGroup}>
          <Text
            fontSize={0.6}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.06}
            outlineColor="#0b1220"
          >
            {label}
          </Text>
        </group>
      </Billboard>

      <Billboard position={[0, 4.1, 0]}>
        <group ref={prompt} visible={false}>
          <mesh material={m.panel} position={[0, 0, -0.01]}>
            <planeGeometry args={[2.6, 0.75]} />
          </mesh>
          <Text fontSize={0.4} color="#fde68a" anchorX="center" anchorY="middle">
            PRESS E
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
