"use client";

import { memo, useMemo } from "react";
import { buildVehicleInstances } from "../../lib/game/city-instances";
import { BOX, CYL, GLASS, std } from "../../lib/game/shared-assets";
import InstancedParts from "./InstancedParts";

const PAINT = std("#ffffff", { roughness: 0.45, metalness: 0.25 });
const TYRE = std("#111827", { roughness: 0.95 });
const LIGHT = std("#ffffff", { roughness: 0.4 });

/** Decorative parked cars, taxis and tro-tros, batched into five draw calls. */
function VehiclesImpl() {
  const v = useMemo(() => buildVehicleInstances(), []);
  return (
    <>
      <InstancedParts items={v.bodies} geometry={BOX} material={PAINT} castShadow />
      <InstancedParts items={v.glass} geometry={BOX} material={GLASS} castShadow />
      <InstancedParts items={v.roofs} geometry={BOX} material={PAINT} castShadow />
      <InstancedParts items={v.wheels} geometry={CYL} material={TYRE} castShadow />
      <InstancedParts items={v.lights} geometry={BOX} material={LIGHT} receiveShadow={false} />
    </>
  );
}

export default memo(VehiclesImpl);
