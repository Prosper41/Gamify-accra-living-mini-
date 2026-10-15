import * as THREE from "three";

/**
 * Shared uniforms for the "see-through" effect: surfaces that sit between the
 * camera and the player are dithered away inside a narrow cylinder, so the
 * player is never hidden behind a building from the fixed third-person angle.
 * FollowCamera updates these every frame.
 */
export const OCCLUSION = {
  player: { value: new THREE.Vector3(0, 1.2, 0) },
  camera: { value: new THREE.Vector3(0, 21, 21) },
  radius: { value: 2.6 },
};

type Shader = Parameters<THREE.Material["onBeforeCompile"]>[0];

function patchShader(shader: Shader) {
  shader.uniforms.uOccPlayer = OCCLUSION.player;
  shader.uniforms.uOccCamera = OCCLUSION.camera;
  shader.uniforms.uOccRadius = OCCLUSION.radius;

  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vOccWorld;")
    .replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      vec4 occW = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        occW = instanceMatrix * occW;
      #endif
      vOccWorld = (modelMatrix * occW).xyz;`
    );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
      varying vec3 vOccWorld;
      uniform vec3 uOccPlayer;
      uniform vec3 uOccCamera;
      uniform float uOccRadius;`
    )
    .replace(
      "void main() {",
      `void main() {
      {
        vec3 occRay = uOccPlayer - uOccCamera;
        float occT = dot(vOccWorld - uOccCamera, occRay) / dot(occRay, occRay);
        if (occT > 0.0 && occT < 0.97) {
          float occD = distance(vOccWorld, uOccCamera + occRay * occT);
          float occFade = 1.0 - smoothstep(uOccRadius * 0.55, uOccRadius, occD);
          float occN = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          if (occN < occFade * 0.92) discard;
        }
      }`
    );
}

export function applyOcclusionFade<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = patchShader;
  material.customProgramCacheKey = () => "occlusion-fade";
  return material;
}
