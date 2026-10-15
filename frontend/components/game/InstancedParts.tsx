"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { PartInstance } from "../../lib/game/types";

interface InstancedPartsProps {
  items: readonly PartInstance[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const dummy = new THREE.Object3D();
const tint = new THREE.Color();

/** Renders many static parts in a single draw call. */
export default function InstancedParts({
  items,
  geometry,
  material,
  castShadow = false,
  receiveShadow = true,
}: InstancedPartsProps) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const useColor = items.some((item) => item.c !== undefined);

    items.forEach((item, i) => {
      dummy.position.set(item.p[0], item.p[1], item.p[2]);
      dummy.rotation.set(item.rx ?? 0, item.ry ?? 0, item.rz ?? 0, "YXZ");
      const s = item.s ?? 1;
      if (typeof s === "number") dummy.scale.set(s, s, s);
      else dummy.scale.set(s[0], s[1], s[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (useColor) mesh.setColorAt(i, tint.set(item.c ?? "#ffffff"));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <instancedMesh
      key={items.length}
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  );
}
