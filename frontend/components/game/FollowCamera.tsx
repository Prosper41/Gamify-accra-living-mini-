"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_OFFSET } from "../../lib/game/city-config";
import { OCCLUSION } from "../../lib/game/occlusion";

const FOLLOW_RATE = 4.5; // 1/seconds, frame-rate independent
const LOOK_RATE = 9;

/**
 * Smooth third-person camera. It keeps the same screen-aligned angle as before
 * (so WASD still maps to the screen) and also feeds the occlusion-fade uniforms.
 */
export default function FollowCamera({ targetRef }: { targetRef: RefObject<THREE.Object3D | null> }) {
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const initialised = useRef(false);

  useFrame(({ camera }, delta) => {
    const target = targetRef.current;
    if (!target) return;
    const dt = Math.min(delta, 0.1);

    desired.set(
      target.position.x + CAMERA_OFFSET.x,
      CAMERA_OFFSET.y,
      target.position.z + CAMERA_OFFSET.z
    );

    if (!initialised.current) {
      camera.position.copy(desired);
      look.copy(target.position);
      initialised.current = true;
    } else {
      camera.position.lerp(desired, 1 - Math.exp(-FOLLOW_RATE * dt));
      look.lerp(target.position, 1 - Math.exp(-LOOK_RATE * dt));
    }

    camera.lookAt(look.x, 1, look.z);

    OCCLUSION.camera.value.copy(camera.position);
    OCCLUSION.player.value.set(target.position.x, 1.2, target.position.z);
  });

  return null;
}
