"use client";

import { memo, useMemo } from "react";
import * as THREE from "three";
import {
  DISTRICTS,
  DRAIN_OUTER,
  PALETTE,
  ROAD_HALF,
  SIDEWALK_OUTER,
  WORLD_EXTENT,
} from "../../lib/game/city-config";
import { buildRoadInstances } from "../../lib/game/city-instances";
import { BOX, std } from "../../lib/game/shared-assets";
import InstancedParts from "./InstancedParts";
import Part from "./Part";

const GROUND = std(PALETTE.grass, { roughness: 1, fade: false });
const ASPHALT = std(PALETTE.asphalt, { roughness: 0.95, fade: false });
const SIDEWALK = std(PALETTE.sidewalk, { roughness: 0.9, fade: false });
const DRAIN = std(PALETTE.drain, { roughness: 1, fade: false });
const MARKING = std("#ffffff", { roughness: 0.9, fade: false });
const CURB = std("#ffffff", { roughness: 0.9, fade: false });
const COVER = std("#ffffff", { roughness: 0.8, fade: false });

/** Soft round alpha texture so each district's ground tint fades into the grass. */
function useBlobTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.6, "rgba(255,255,255,0.95)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function DistrictGround() {
  const blob = useBlobTexture();
  const materials = useMemo(
    () =>
      DISTRICTS.map(
        (d) =>
          new THREE.MeshStandardMaterial({
            color: d.ground,
            map: blob,
            transparent: true,
            depthWrite: false,
            roughness: 1,
          })
      ),
    [blob]
  );

  return (
    <>
      {DISTRICTS.map((d, i) => (
        <mesh
          key={d.id}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[d.sx * 22, 0.02, d.sz * 22]}
          material={materials[i]}
          receiveShadow
        >
          <planeGeometry args={[56, 56]} />
        </mesh>
      ))}
    </>
  );
}

function RoadNetworkImpl() {
  const { markings, curbs, drainCovers } = useMemo(buildRoadInstances, []);
  const stripLength = WORLD_EXTENT - ROAD_HALF;
  const stripCentre = ROAD_HALF + stripLength / 2;
  const outerLength = WORLD_EXTENT - SIDEWALK_OUTER;
  const outerCentre = SIDEWALK_OUTER + outerLength / 2;
  const drainLength = WORLD_EXTENT - DRAIN_OUTER;
  const drainCentre = DRAIN_OUTER + drainLength / 2;
  const sidewalkWidth = SIDEWALK_OUTER - ROAD_HALF;
  const sidewalkMid = ROAD_HALF + sidewalkWidth / 2;
  const drainWidth = DRAIN_OUTER - SIDEWALK_OUTER;
  const drainMid = SIDEWALK_OUTER + drainWidth / 2;
  const signs = [-1, 1] as const;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={GROUND} receiveShadow>
        <planeGeometry args={[400, 400]} />
      </mesh>
      <DistrictGround />

      {/* Asphalt: the X road is continuous, the Z road is split around the junction */}
      <Part p={[0, 0.03, 0]} s={[WORLD_EXTENT * 2, 0.06, ROAD_HALF * 2]} m={ASPHALT} cast={false} />
      {signs.map((s) => (
        <Part
          key={`z-${s}`}
          p={[0, 0.03, s * stripCentre]}
          s={[ROAD_HALF * 2, 0.06, stripLength]}
          m={ASPHALT}
          cast={false}
        />
      ))}

      {/* Sidewalks, one L per quadrant, plus open drains behind them */}
      {signs.map((sx) =>
        signs.map((sz) => (
          <group key={`${sx}${sz}`}>
            <Part p={[sx * stripCentre, 0.08, sz * sidewalkMid]} s={[stripLength, 0.16, sidewalkWidth]} m={SIDEWALK} />
            <Part p={[sx * sidewalkMid, 0.08, sz * outerCentre]} s={[sidewalkWidth, 0.16, outerLength]} m={SIDEWALK} />

            <Part p={[sx * drainCentre, 0.03, sz * drainMid]} s={[drainLength, 0.06, drainWidth]} m={DRAIN} cast={false} />
            <Part p={[sx * drainMid, 0.03, sz * drainCentre]} s={[drainWidth, 0.06, drainLength]} m={DRAIN} cast={false} />
            <Part p={[sx * drainMid, 0.03, sz * drainMid]} s={[drainWidth, 0.06, drainWidth]} m={DRAIN} cast={false} />
          </group>
        ))
      )}

      <InstancedParts items={curbs} geometry={BOX} material={CURB} receiveShadow />
      <InstancedParts items={drainCovers} geometry={BOX} material={COVER} receiveShadow />
      <InstancedParts items={markings} geometry={BOX} material={MARKING} receiveShadow />
    </>
  );
}

export default memo(RoadNetworkImpl);
