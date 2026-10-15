"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOX, SPHERE, std } from "../../lib/game/shared-assets";

/** Written by PlayerController, read here to drive the walk cycle. */
export interface AnimState {
  /** 0 = standing, 1 = full speed */
  amount: number;
  /** walk-cycle phase in radians */
  phase: number;
}

const SKIN = "#8d5524";
const mat = (c: string) => std(c, { roughness: 0.75, fade: false });

const LEG = new THREE.CapsuleGeometry(0.11, 0.5, 4, 8);
const SLEEVE = new THREE.CapsuleGeometry(0.085, 0.2, 4, 8);
const FOREARM = new THREE.CapsuleGeometry(0.065, 0.2, 4, 8);
const TORSO = new THREE.CapsuleGeometry(0.22, 0.32, 4, 12);
const CAP = new THREE.SphereGeometry(0.215, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);

const skin = mat(SKIN);
const shirt = mat("#10b981");
const pants = mat("#1e3a5f");
const shoe = mat("#f8fafc");
const sole = mat("#f59e0b");
const cap = mat("#0f172a");
const bag = mat("#f59e0b");
const bagDark = mat("#b45309");
const eye = mat("#111827");

/** Stylised delivery rider built from shared primitives, facing local +z. */
export default function PlayerCharacter({ anim }: { anim: RefObject<AnimState> }) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const { amount, phase } = anim.current;
    const t = clock.elapsedTime;
    const swing = Math.sin(phase) * 0.85 * amount;
    const idle = 1 - amount;

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) {
      armL.current.rotation.x = -swing * 0.9;
      armL.current.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.03 * idle;
    }
    if (armR.current) {
      armR.current.rotation.x = swing * 0.9;
      armR.current.rotation.z = -0.06 - Math.sin(t * 1.6) * 0.03 * idle;
    }
    if (root.current) root.current.position.y = Math.abs(Math.cos(phase)) * 0.07 * amount;
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2) * 0.012 * idle;
    if (head.current) head.current.rotation.y = Math.sin(t * 0.8) * 0.15 * idle;
  });

  return (
    <group ref={root}>
      {/* legs */}
      {([-1, 1] as const).map((side) => (
        <group key={side} ref={side === -1 ? legL : legR} position={[side * 0.15, 0.8, 0]}>
          <mesh geometry={LEG} material={pants} position={[0, -0.34, 0]} castShadow />
          <mesh geometry={BOX} material={shoe} position={[0, -0.72, 0.06]} scale={[0.25, 0.16, 0.44]} castShadow />
          <mesh geometry={BOX} material={sole} position={[0, -0.78, 0.06]} scale={[0.26, 0.05, 0.45]} />
        </group>
      ))}

      {/* hips and torso */}
      <mesh geometry={BOX} material={pants} position={[0, 0.88, 0]} scale={[0.46, 0.2, 0.3]} castShadow />
      <mesh ref={torso} geometry={TORSO} material={shirt} position={[0, 1.24, 0]} scale={[1, 1, 0.72]} castShadow />

      {/* arms */}
      {([-1, 1] as const).map((side) => (
        <group key={side} ref={side === -1 ? armL : armR} position={[side * 0.32, 1.52, 0]}>
          <mesh geometry={SLEEVE} material={shirt} position={[0, -0.17, 0]} castShadow />
          <mesh geometry={FOREARM} material={skin} position={[0, -0.44, 0]} castShadow />
          <mesh geometry={SPHERE} material={skin} position={[0, -0.62, 0]} scale={0.07} castShadow />
        </group>
      ))}

      {/* delivery bag and straps */}
      <mesh geometry={BOX} material={bag} position={[0, 1.3, -0.3]} scale={[0.46, 0.5, 0.28]} castShadow />
      <mesh geometry={BOX} material={bagDark} position={[0, 1.57, -0.3]} scale={[0.48, 0.08, 0.3]} castShadow />
      <mesh geometry={BOX} material={bagDark} position={[-0.13, 1.28, 0.16]} scale={[0.06, 0.6, 0.03]} />
      <mesh geometry={BOX} material={bagDark} position={[0.13, 1.28, 0.16]} scale={[0.06, 0.6, 0.03]} />

      {/* head */}
      <group ref={head} position={[0, 1.82, 0]}>
        <mesh geometry={BOX} material={skin} position={[0, -0.16, 0]} scale={[0.12, 0.1, 0.12]} />
        <mesh geometry={SPHERE} material={skin} scale={[0.2, 0.22, 0.2]} castShadow />
        <mesh geometry={SPHERE} material={eye} position={[-0.07, 0.02, 0.185]} scale={0.025} />
        <mesh geometry={SPHERE} material={eye} position={[0.07, 0.02, 0.185]} scale={0.025} />
        <mesh geometry={CAP} material={cap} position={[0, 0.04, 0]} rotation={[-0.12, 0, 0]} castShadow />
        <mesh geometry={BOX} material={cap} position={[0, 0.08, 0.22]} scale={[0.3, 0.03, 0.2]} castShadow />
      </group>
    </group>
  );
}
