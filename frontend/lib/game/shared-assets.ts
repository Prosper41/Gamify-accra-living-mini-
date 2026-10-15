import * as THREE from "three";
import { applyOcclusionFade } from "./occlusion";

/** Unit geometries, scaled per mesh so every object reuses the same GPU buffers. */
export const BOX = new THREE.BoxGeometry(1, 1, 1);
export const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
export const CONE4 = new THREE.ConeGeometry(1, 1, 4);
export const ICO = new THREE.IcosahedronGeometry(1, 1);
export const SPHERE = new THREE.SphereGeometry(1, 14, 10);

interface StdOptions {
  roughness?: number;
  metalness?: number;
  flatShading?: boolean;
  /** Dither away when between camera and player (disable for ground and the player) */
  fade?: boolean;
}

const cache = new Map<string, THREE.MeshStandardMaterial>();

/** Cached MeshStandardMaterial so identical colours share one material. */
export function std(color: string, options: StdOptions = {}): THREE.MeshStandardMaterial {
  const { roughness = 0.85, metalness = 0, flatShading = false, fade = true } = options;
  const key = `${color}|${roughness}|${metalness}|${flatShading}|${fade}`;
  let material = cache.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading });
    if (fade) applyOcclusionFade(material);
    cache.set(key, material);
  }
  return material;
}

export const GLASS = std("#9ad7ee", { roughness: 0.25, metalness: 0.1 });

export const LAMP_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#fff6d0",
  emissive: "#ffe29a",
  emissiveIntensity: 1.1,
});
