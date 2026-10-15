"use client";

import { memo, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BENCHES,
  BILLBOARDS,
  BINS,
  PALETTE,
  SIGNS,
  STREETLIGHTS,
  type BillboardDef,
  type SignDef,
} from "../../lib/game/city-config";
import { localToWorld } from "../../lib/game/city-instances";
import { BOX, CYL, LAMP_MATERIAL, SPHERE, std } from "../../lib/game/shared-assets";
import type { PartInstance } from "../../lib/game/types";
import InstancedParts from "./InstancedParts";
import Part from "./Part";

const POLE_MATERIAL = std("#ffffff", { roughness: 0.6, metalness: 0.2 });

/* ------------------------------ Streetlights ----------------------------- */

function Streetlights() {
  const { poles, arms, lamps } = useMemo(() => {
    const poles: PartInstance[] = [];
    const arms: PartInstance[] = [];
    const lamps: PartInstance[] = [];
    for (const l of STREETLIGHTS) {
      poles.push({ p: [l.x, 2.6, l.z], s: [0.18, 5.2, 0.18], c: PALETTE.metal });
      arms.push({ p: localToWorld(l.x, l.z, l.ry, 0.6, 5.15, 0), s: [1.3, 0.1, 0.1], ry: l.ry, c: PALETTE.metal });
      lamps.push({ p: localToWorld(l.x, l.z, l.ry, 1.15, 5.05, 0), s: [0.7, 0.12, 0.36], ry: l.ry });
    }
    return { poles, arms, lamps };
  }, []);

  return (
    <>
      <InstancedParts items={poles} geometry={CYL} material={POLE_MATERIAL} castShadow />
      <InstancedParts items={arms} geometry={BOX} material={POLE_MATERIAL} castShadow />
      <InstancedParts items={lamps} geometry={BOX} material={LAMP_MATERIAL} receiveShadow={false} />
    </>
  );
}

/* ----------------------------- Traffic lights ---------------------------- */

type Phase = "g" | "a" | "r";

/** Axis A = traffic on the X road, axis B = traffic on the Z road. Cycle 22 s. */
function phaseFor(axis: "A" | "B", t: number): Phase {
  const c = t % 22;
  if (axis === "A") return c < 8 ? "g" : c < 9.5 ? "a" : "r";
  return c >= 11 && c < 19 ? "g" : c >= 19 && c < 20.5 ? "a" : "r";
}

function lampMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: "#1f2937", emissive: color, emissiveIntensity: 0.05 });
}

function TrafficLights() {
  const mats = useMemo(
    () => ({
      A: { r: lampMaterial("#ef4444"), a: lampMaterial("#fbbf24"), g: lampMaterial("#22c55e") },
      B: { r: lampMaterial("#ef4444"), a: lampMaterial("#fbbf24"), g: lampMaterial("#22c55e") },
    }),
    []
  );

  const layout = useMemo(() => {
    const poles: PartInstance[] = [];
    const heads: PartInstance[] = [];
    const lamps = { A: { r: [], a: [], g: [] }, B: { r: [], a: [], g: [] } } as Record<
      "A" | "B",
      Record<Phase, PartInstance[]>
    >;
    const lampY = { r: 4.4, a: 4.0, g: 3.6 } as const;

    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const px = sx * 5.3;
        const pz = sz * 5.3;
        poles.push({ p: [px, 2.3, pz], s: [0.14, 4.6, 0.14], c: "#374151" });

        // head A faces along X (towards traffic on the X road)
        heads.push({ p: [px + sx * 0.28, 4.0, pz], s: [0.3, 1.3, 0.45], c: "#111827" });
        // head B faces along Z
        heads.push({ p: [px, 4.0, pz + sz * 0.28], s: [0.45, 1.3, 0.3], c: "#111827" });

        (["r", "a", "g"] as const).forEach((phase) => {
          lamps.A[phase].push({ p: [px + sx * 0.46, lampY[phase], pz], s: [0.08, 0.26, 0.26] });
          lamps.B[phase].push({ p: [px, lampY[phase], pz + sz * 0.46], s: [0.26, 0.26, 0.08] });
        });
      }
    }
    return { poles, heads, lamps };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    (["A", "B"] as const).forEach((axis) => {
      const phase = phaseFor(axis, t);
      (["r", "a", "g"] as const).forEach((p) => {
        mats[axis][p].emissiveIntensity = p === phase ? 2.2 : 0.05;
      });
    });
  });

  return (
    <>
      <InstancedParts items={layout.poles} geometry={CYL} material={POLE_MATERIAL} castShadow />
      <InstancedParts items={layout.heads} geometry={BOX} material={POLE_MATERIAL} castShadow />
      {(["A", "B"] as const).map((axis) =>
        (["r", "a", "g"] as const).map((p) => (
          <InstancedParts
            key={`${axis}${p}`}
            items={layout.lamps[axis][p]}
            geometry={SPHERE}
            material={mats[axis][p]}
            receiveShadow={false}
          />
        ))
      )}
    </>
  );
}

/* --------------------------------- Signs --------------------------------- */

function RoadSign({ sign }: { sign: SignDef }) {
  return (
    <group position={[sign.x, 0, sign.z]}>
      <Part p={[0, 1.7, 0]} g={CYL} s={[0.1, 3.4, 0.1]} c="#6b7280" />
      {sign.kind === "speed" ? (
        <>
          <Part p={[0, 3.2, 0.05]} g={CYL} r={[Math.PI / 2, 0, 0]} s={[0.95, 0.06, 0.95]} c="#dc2626" />
          <Part p={[0, 3.2, 0.09]} g={CYL} r={[Math.PI / 2, 0, 0]} s={[0.7, 0.06, 0.7]} c="#ffffff" />
          <Text position={[0, 3.2, 0.13]} fontSize={0.38} color="#111827" anchorX="center" anchorY="middle">
            {sign.text}
          </Text>
        </>
      ) : (
        <>
          <Part p={[0, 3.4, 0]} s={[2.6, 0.55, 0.08]} c="#0f766e" />
          <Text position={[0, 3.4, 0.06]} fontSize={0.24} color="#ffffff" anchorX="center" anchorY="middle">
            {sign.text}
          </Text>
        </>
      )}
    </group>
  );
}

/* ------------------------------- Billboards ------------------------------ */

function Billboard3D({ board }: { board: BillboardDef }) {
  const legX = board.w / 2 - 0.5;
  return (
    <group position={[board.x, 0, board.z]}>
      <Part p={[-legX, 2.1, 0]} g={CYL} s={[0.28, 4.2, 0.28]} c="#374151" />
      <Part p={[legX, 2.1, 0]} g={CYL} s={[0.28, 4.2, 0.28]} c="#374151" />
      <Part p={[0, 5.6, 0]} s={[board.w + 0.3, 2.9, 0.3]} c="#1f2937" />
      <Part p={[0, 5.6, 0.18]} s={[board.w, 2.6, 0.1]} c={board.bg} />
      <Text
        position={[0, 5.95, 0.25]}
        fontSize={Math.min(0.6, (board.w - 0.6) / (board.title.length * 0.62))}
        color={board.fg}
        anchorX="center"
        anchorY="middle"
      >
        {board.title}
      </Text>
      <Text position={[0, 5.0, 0.25]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">
        {board.sub}
      </Text>
    </group>
  );
}

/* ----------------------------- Benches and bins -------------------------- */

function Bench({ x, z, ry }: { x: number; z: number; ry: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <Part p={[0, 0.5, 0]} s={[1.7, 0.1, 0.5]} c="#a16207" />
      <Part p={[0, 0.85, -0.22]} s={[1.7, 0.45, 0.08]} c="#a16207" />
      <Part p={[-0.7, 0.25, 0]} s={[0.1, 0.5, 0.4]} c="#374151" />
      <Part p={[0.7, 0.25, 0]} s={[0.1, 0.5, 0.4]} c="#374151" />
    </group>
  );
}

function Bin({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Part p={[0, 0.5, 0]} g={CYL} s={[0.55, 0.9, 0.55]} c="#166534" />
      <Part p={[0, 1.0, 0]} g={CYL} s={[0.62, 0.1, 0.62]} c="#14532d" />
    </group>
  );
}

function StreetPropsImpl() {
  return (
    <>
      <Streetlights />
      <TrafficLights />
      {SIGNS.map((s) => (
        <RoadSign key={`${s.kind}-${s.x}-${s.z}`} sign={s} />
      ))}
      {BILLBOARDS.map((b) => (
        <Billboard3D key={b.title} board={b} />
      ))}
      {BENCHES.map((b) => (
        <Bench key={`${b.x}-${b.z}`} {...b} />
      ))}
      {BINS.map((b) => (
        <Bin key={`${b.x}-${b.z}`} {...b} />
      ))}
    </>
  );
}

export default memo(StreetPropsImpl);
