"use client";

import type * as THREE from "three";
import { BOX, std } from "../../lib/game/shared-assets";

interface PartProps {
  p: [number, number, number];
  s: [number, number, number];
  /** colour (resolved through the shared material cache) */
  c?: string;
  /** or an explicit material */
  m?: THREE.Material;
  g?: THREE.BufferGeometry;
  r?: [number, number, number];
  cast?: boolean;
  receive?: boolean;
}

/** One scaled mesh that reuses shared unit geometry and cached materials. */
export default function Part({ p, s, c, m, g = BOX, r, cast = true, receive = true }: PartProps) {
  return (
    <mesh
      geometry={g}
      material={m ?? std(c ?? "#ffffff")}
      position={p}
      scale={s}
      rotation={r}
      castShadow={cast}
      receiveShadow={receive}
    />
  );
}
