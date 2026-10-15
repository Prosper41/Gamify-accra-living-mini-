"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";
import {
  BUILDINGS,
  PALETTE,
  PLAZA,
  TREES,
  getBuildingBounds,
} from "../../lib/game/city-config";
import { distanceToBounds } from "../../lib/game/collision";
import { BOX, CYL, ICO, SPHERE, std } from "../../lib/game/shared-assets";
import type { PartInstance } from "../../lib/game/types";
import InstancedParts from "./InstancedParts";

const TRUNK = std("#ffffff", { roughness: 1 });
const LEAF = std("#ffffff", { roughness: 0.9, flatShading: true });
const BLOOM = std("#ffffff", { roughness: 0.8 });

const GREENS = ["#2e8549", "#3c9b58", "#2a7a45", "#4aa862"];
const PALM_GREENS = ["#2f8f4e", "#3aa05a", "#267d44"];
const BLOOMS = ["#f97316", "#ec4899", "#facc15", "#a855f7"];

function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function buildVegetation() {
  const trunks: PartInstance[] = [];
  const canopy: PartInstance[] = [];
  const fronds: PartInstance[] = [];
  const shrubs: PartInstance[] = [];

  TREES.forEach((t, i) => {
    const sc = t.scale;
    if (t.kind === "broad") {
      trunks.push({ p: [t.x, 1.3 * sc, t.z], s: [0.42 * sc, 2.6 * sc, 0.42 * sc], c: "#7a5338" });
      canopy.push({ p: [t.x, 3.2 * sc, t.z], s: 1.5 * sc, c: GREENS[i % GREENS.length] });
      canopy.push({ p: [t.x + 0.75 * sc, 2.7 * sc, t.z + 0.3 * sc], s: 0.9 * sc, c: GREENS[(i + 1) % GREENS.length] });
      canopy.push({ p: [t.x - 0.6 * sc, 2.9 * sc, t.z - 0.4 * sc], s: 0.8 * sc, c: GREENS[(i + 2) % GREENS.length] });
      shrubs.push({
        p: [t.x + 0.95 * sc, 0.3 * sc, t.z + 0.8 * sc],
        s: [0.7 * sc, 0.5 * sc, 0.7 * sc],
        c: GREENS[(i + 3) % GREENS.length],
      });
    } else {
      const top = 5.2 * sc;
      trunks.push({ p: [t.x, top / 2, t.z], s: [0.34 * sc, top, 0.34 * sc], c: "#8b6a4a" });
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + hash(i + 1) * 2;
        fronds.push({
          p: [t.x + Math.cos(a) * 0.99 * sc, top - 0.38 * sc, t.z - Math.sin(a) * 0.99 * sc],
          s: [2.2 * sc, 0.06, 0.6 * sc],
          ry: a,
          rz: -0.45,
          c: PALM_GREENS[k % PALM_GREENS.length],
        });
      }
      canopy.push({ p: [t.x, top, t.z], s: 0.28 * sc, c: "#6b4a2b" });
    }
  });

  return { trunks, canopy, fronds, shrubs };
}

function buildPlantings() {
  const base: PartInstance[] = [];
  const blooms: PartInstance[] = [];
  const bounds = BUILDINGS.map(getBuildingBounds);

  for (let k = 0; k < 12; k++) {
    if (k % 3 === 0) continue; // benches sit at the compass points
    const a = (k / 12) * Math.PI * 2;
    const x = PLAZA.x + Math.cos(a) * 5.5;
    const z = PLAZA.z + Math.sin(a) * 5.5;
    if (bounds.some((b) => distanceToBounds(x, z, b) < 1.2)) continue;

    base.push({ p: [x, 0.2, z], s: [1.5, 0.4, 1.5], c: "#3f8f4f" });
    for (let f = 0; f < 4; f++) {
      const fa = f * 1.57 + k;
      blooms.push({
        p: [x + Math.cos(fa) * 0.35, 0.48, z + Math.sin(fa) * 0.35],
        s: 0.22,
        c: BLOOMS[(k + f) % BLOOMS.length],
      });
    }
  }
  return { base, blooms };
}

function Plaza() {
  const rings = useMemo(
    () =>
      [
        { inner: 3.55, outer: 3.8, color: PALETTE.ghanaRed },
        { inner: 3.8, outer: 4.05, color: PALETTE.ghanaGold },
        { inner: 4.05, outer: 4.3, color: PALETTE.ghanaGreen },
      ].map((r) => ({
        geometry: new THREE.RingGeometry(r.inner, r.outer, 64),
        material: std(r.color, { roughness: 0.7, fade: false }),
      })),
    []
  );

  return (
    <group position={[PLAZA.x, 0, PLAZA.z]}>
      <mesh geometry={CYL} material={std("#a8a29a", { fade: false })} position={[0, 0.03, 0]} scale={[9.2, 0.06, 9.2]} receiveShadow />
      <mesh geometry={CYL} material={std("#ddd7c8", { fade: false })} position={[0, 0.05, 0]} scale={[8.6, 0.06, 8.6]} receiveShadow />
      {rings.map((r, i) => (
        <mesh key={i} geometry={r.geometry} material={r.material} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.085, 0]} receiveShadow />
      ))}
    </group>
  );
}

function VegetationImpl() {
  const { trunks, canopy, fronds, shrubs } = useMemo(buildVegetation, []);
  const { base, blooms } = useMemo(buildPlantings, []);

  return (
    <>
      <Plaza />
      <InstancedParts items={trunks} geometry={CYL} material={TRUNK} castShadow />
      <InstancedParts items={canopy} geometry={ICO} material={LEAF} castShadow />
      <InstancedParts items={fronds} geometry={BOX} material={LEAF} castShadow />
      <InstancedParts items={shrubs} geometry={ICO} material={LEAF} castShadow />
      <InstancedParts items={base} geometry={BOX} material={LEAF} />
      <InstancedParts items={blooms} geometry={SPHERE} material={BLOOM} />
    </>
  );
}

export default memo(VegetationImpl);
