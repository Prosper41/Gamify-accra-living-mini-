"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../../lib/game/city-config";
import type { PartInstance } from "../../lib/game/types";
import { ICO } from "../../lib/game/shared-assets";
import InstancedParts from "./InstancedParts";

const DOME_RADIUS = 180;

function SkyDome() {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(DOME_RADIUS, 24, 14);
    const pos = geo.attributes.position;
    const top = new THREE.Color(PALETTE.skyTop);
    const horizon = new THREE.Color(PALETTE.skyHorizon);
    const c = new THREE.Color();
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const h = Math.max(pos.getY(i) / DOME_RADIUS, 0);
      c.copy(horizon).lerp(top, Math.pow(h, 0.6));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} renderOrder={-1}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

const CLOUD_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#ffffff",
  emissiveIntensity: 0.35,
  flatShading: true,
  roughness: 1,
  fog: false,
});

function Clouds() {
  const group = useRef<THREE.Group>(null);

  const puffs = useMemo<PartInstance[]>(() => {
    const items: PartInstance[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      const r = 70 + (i % 3) * 22;
      const y = 48 + (i % 2) * 10;
      const cx = Math.cos(a) * r;
      const cz = Math.sin(a) * r;
      items.push({ p: [cx, y, cz], s: [7, 2.6, 4.5] });
      items.push({ p: [cx + 5, y + 0.8, cz + 1], s: [5, 2.4, 3.6] });
      items.push({ p: [cx - 5.5, y + 0.2, cz - 1], s: [4.5, 2, 3.2] });
    }
    return items;
  }, []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += Math.min(delta, 0.1) * 0.008;
  });

  return (
    <group ref={group}>
      <InstancedParts items={puffs} geometry={ICO} material={CLOUD_MATERIAL} receiveShadow={false} />
    </group>
  );
}

/** Daylight rig: sky, fog, sun with one shadow map, soft sky/ground fill. */
function LightingImpl() {
  return (
    <>
      <color attach="background" args={[PALETTE.skyHorizon]} />
      <fog attach="fog" args={[PALETTE.fog, 75, 160]} />

      <hemisphereLight args={["#fff3da", "#5d8a58", 1.5]} />
      <ambientLight intensity={0.2} color="#e6f1ff" />

      <directionalLight
        position={[24, 38, 16]}
        intensity={2.6}
        color="#fff0d2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-camera-near={5}
        shadow-camera-far={110}
        shadow-bias={-0.0005}
        shadow-normalBias={0.05}
      />

      <SkyDome />
      <Clouds />
    </>
  );
}

export default memo(LightingImpl);
