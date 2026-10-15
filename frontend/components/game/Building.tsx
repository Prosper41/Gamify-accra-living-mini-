"use client";

import { memo, useMemo } from "react";
import { Text } from "@react-three/drei";
import {
  BUILDINGS,
  FACING_YAW,
  PALETTE,
  type BuildingDef,
} from "../../lib/game/city-config";
import { buildBuildingInstances } from "../../lib/game/city-instances";
import { BOX, CONE4, CYL, GLASS, std } from "../../lib/game/shared-assets";
import InstancedParts from "./InstancedParts";
import Part from "./Part";

const FRAME_MATERIAL = std("#ffffff", { roughness: 0.6 });
const PANEL_MATERIAL = std("#ffffff", { roughness: 0.9 });
const GLASS_MATERIAL = std("#ffffff", { roughness: 0.25, metalness: 0.1 });

function fitFontSize(text: string, width: number, max: number): number {
  return Math.min(max, width / (text.length * 0.62));
}

/* ------------------------------- Shops ----------------------------------- */

function ShopDetails({ b }: { b: BuildingDef }) {
  const sign = b.sign;
  if (!sign) return null;

  if (b.shop === "momo") {
    return (
      <>
        <Part p={[0, 1.5, b.d / 2 + 0.04]} s={[b.w * 0.62, 0.9, 0.08]} m={GLASS} cast={false} />
        <Part p={[0, 1.02, b.d / 2 + 0.22]} s={[b.w * 0.8, 0.08, 0.42]} c="#e2e8f0" />
        <Part p={[0, 2.55, b.d / 2 + 0.08]} s={[b.w + 0.1, 0.5, 0.12]} c={sign.bg} />
        <Text
          position={[0, 2.55, b.d / 2 + 0.16]}
          fontSize={0.3}
          color={sign.fg}
          anchorX="center"
          anchorY="middle"
        >
          {sign.text}
        </Text>
        <Part p={[0, b.h + 0.06, 0]} s={[b.w + 0.5, 0.12, b.d + 0.6]} c={b.accent} />
      </>
    );
  }

  const boardW = b.w * 0.92;
  return (
    <>
      <Part p={[0, 0.55, 0]} s={[b.w + 0.06, 1.1, b.d + 0.06]} c={b.accent} />
      <Part p={[0, 3.7, b.d / 2 + 0.1]} s={[boardW, 0.9, 0.18]} c={sign.bg} />
      <Text
        position={[0, 3.7, b.d / 2 + 0.21]}
        fontSize={fitFontSize(sign.text, boardW - 0.3, 0.5)}
        color={sign.fg}
        anchorX="center"
        anchorY="middle"
        maxWidth={boardW - 0.3}
      >
        {sign.text}
      </Text>

      <Part p={[-b.w * 0.12, 1.4, b.d / 2 + 0.04]} s={[b.w * 0.56, 2, 0.08]} m={GLASS} cast={false} />
      <Part p={[b.w * 0.3, 1.15, b.d / 2 + 0.06]} s={[1.2, 2.1, 0.1]} c="#1f2937" />

      <Part p={[0, b.h + 0.2, 0]} s={[b.w + 0.25, 0.4, b.d + 0.25]} c={b.accent} />
      <Part p={[b.w * 0.25, b.h + 0.8, -b.d * 0.2]} s={[1.2, 0.8, 0.9]} c="#cbd5e1" />
    </>
  );
}

/* ----------------------------- Apartments -------------------------------- */

function ApartmentDetails({ b }: { b: BuildingDef }) {
  return (
    <>
      <Part p={[0, 2.7, b.d / 2 + 0.8]} s={[3.2, 0.14, 1.6]} c={b.accent} />
      <Part p={[0, 1.1, b.d / 2 + 0.06]} s={[1.7, 2.2, 0.12]} c="#1f2937" />
      <Part p={[-b.w / 2 + 0.1, b.h / 2, b.d / 2]} s={[0.4, b.h, 0.4]} c={b.accent} />
      <Part p={[b.w / 2 - 0.1, b.h / 2, b.d / 2]} s={[0.4, b.h, 0.4]} c={b.accent} />

      <Part p={[0, b.h + 0.22, 0]} s={[b.w + 0.3, 0.44, b.d + 0.3]} c={b.accent} />
      <Part p={[-b.w * 0.25, b.h + 1.1, -b.d * 0.15]} s={[2.2, 1.8, 2.2]} c="#cbd5e1" />
      <Part p={[b.w * 0.25, b.h + 0.75, 0.2]} s={[0.3, 0.6, 0.3]} c="#64748b" cast={false} />
      <Part p={[b.w * 0.25, b.h + 1.5, 0.2]} g={CYL} s={[1.5, 1.2, 1.5]} c="#1e3a8a" />
    </>
  );
}

/* ------------------------------- Villas ---------------------------------- */

function VillaDetails({ b }: { b: BuildingDef }) {
  const yard = b.yard ?? 1.3;
  const wallZ = b.d / 2 + yard;
  const roofColor = b.roofColor ?? "#b4532a";

  return (
    <>
      {/* porch */}
      <Part p={[0, 0.26, b.d / 2 + 0.5]} s={[3, 0.12, 1]} c="#e5e7eb" />
      <Part p={[-1.1, 1.6, b.d / 2 + 0.85]} g={CYL} s={[0.32, 3, 0.32]} c="#ffffff" />
      <Part p={[1.1, 1.6, b.d / 2 + 0.85]} g={CYL} s={[0.32, 3, 0.32]} c="#ffffff" />
      <Part p={[0, 3.2, b.d / 2 + 0.6]} s={[3.2, 0.2, 1.3]} c={b.accent} />
      <Part p={[0, 1.1, b.d / 2 + 0.06]} s={[1.3, 2.2, 0.12]} c="#7c4a2d" />

      {/* compound wall, pillars and gate */}
      <Part p={[0, 0.55, wallZ]} s={[b.w, 1.1, 0.22]} c="#f1ece0" />
      <Part p={[-b.w / 2 + 0.11, 0.55, b.d / 2 + yard / 2]} s={[0.22, 1.1, yard]} c="#f1ece0" />
      <Part p={[b.w / 2 - 0.11, 0.55, b.d / 2 + yard / 2]} s={[0.22, 1.1, yard]} c="#f1ece0" />
      <Part p={[-1.3, 0.85, wallZ]} s={[0.4, 1.7, 0.4]} c="#e7e0d0" />
      <Part p={[1.3, 0.85, wallZ]} s={[0.4, 1.7, 0.4]} c="#e7e0d0" />
      <Part p={[0, 0.65, wallZ + 0.02]} s={[2.2, 1.3, 0.08]} c="#1f2937" />

      {b.roof === "flat" ? (
        <>
          <Part p={[0, b.h + 0.25, 0]} s={[b.w + 0.5, 0.5, b.d + 0.5]} c={roofColor} />
          <Part p={[0, 3.4, b.d / 2 + 0.2]} s={[b.w * 0.8, 0.14, 1.0]} c={b.accent} />
          <Part p={[-b.w * 0.25, b.h + 0.9, -b.d * 0.1]} s={[1.6, 0.9, 1.6]} c="#cbd5e1" />
        </>
      ) : (
        <>
          <Part p={[0, b.h + 0.1, 0]} s={[b.w + 0.7, 0.2, b.d + 0.7]} c={roofColor} />
          <group
            position={[0, b.h + 1.3, 0]}
            scale={[(b.w + 0.7) / Math.SQRT2, 2.2, (b.d + 0.7) / Math.SQRT2]}
          >
            <mesh
              geometry={CONE4}
              material={std(roofColor, { roughness: 0.7 })}
              rotation={[0, Math.PI / 4, 0]}
              castShadow
              receiveShadow
            />
          </group>
        </>
      )}
    </>
  );
}

/* -------------------------------- Office --------------------------------- */

function OfficeDetails({ b }: { b: BuildingDef }) {
  return (
    <>
      <Part p={[0, 1.6, b.d / 2 + 0.05]} s={[b.w * 0.8, 3, 0.1]} m={GLASS} cast={false} />
      <Part p={[0, 3.3, b.d / 2 + 1]} s={[b.w * 0.9, 0.18, 2]} c={b.accent} />
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Part
            key={`${sx}${sz}`}
            p={[(sx * b.w) / 2, b.h / 2, (sz * b.d) / 2]}
            s={[0.5, b.h, 0.5]}
            c={b.accent}
          />
        ))
      )}
      <Part p={[0, b.h + 0.25, 0]} s={[b.w + 0.2, 0.5, b.d + 0.2]} c={b.accent} />
      <Part p={[0, b.h + 1.2, 0]} s={[b.w * 0.6, 1.4, b.d * 0.6]} c="#475569" />
      <Part p={[b.w * 0.2, b.h + 4, 0]} g={CYL} s={[0.14, 5, 0.14]} c="#94a3b8" cast={false} />
    </>
  );
}

/* ------------------------------ Roof signs ------------------------------- */

function RoofSign({ b }: { b: BuildingDef }) {
  if (!b.roofSign) return null;
  const boardW = 6.2;
  const top = b.h + (b.kind === "office" ? 1.9 : 0.5);

  return (
    // counter-rotate so the board always faces the camera side (+z)
    <group position={[0, top, 0]} rotation={[0, -FACING_YAW[b.facing], 0]}>
      <Part p={[-boardW / 2 + 0.6, 1, 0]} g={CYL} s={[0.2, 2, 0.2]} c="#334155" />
      <Part p={[boardW / 2 - 0.6, 1, 0]} g={CYL} s={[0.2, 2, 0.2]} c="#334155" />
      <Part p={[0, 2.4, 0]} s={[boardW, 1.7, 0.22]} c={b.roofSign.bg} />
      <Text
        position={[0, 2.4, 0.13]}
        fontSize={fitFontSize(b.roofSign.text, boardW - 0.8, 1.05)}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#0f172a"
      >
        {b.roofSign.text}
      </Text>
    </group>
  );
}

/* ------------------------------ Composition ------------------------------ */

const BuildingMesh = memo(function BuildingMesh({ b }: { b: BuildingDef }) {
  return (
    <group position={[b.x, 0, b.z]} rotation={[0, FACING_YAW[b.facing], 0]}>
      <Part p={[0, 0.1, 0]} s={[b.w + 0.5, 0.2, b.d + 0.5]} c={PALETTE.concrete} />
      <Part p={[0, b.h / 2, 0]} s={[b.w, b.h, b.d]} c={b.wall} />
      {b.kind === "shop" && <ShopDetails b={b} />}
      {b.kind === "apartment" && <ApartmentDetails b={b} />}
      {b.kind === "villa" && <VillaDetails b={b} />}
      {b.kind === "office" && <OfficeDetails b={b} />}
      <RoofSign b={b} />
    </group>
  );
});

function BuildingsImpl() {
  const details = useMemo(() => buildBuildingInstances(BUILDINGS), []);

  return (
    <>
      {BUILDINGS.map((b) => (
        <BuildingMesh key={b.id} b={b} />
      ))}
      <InstancedParts items={details.frames} geometry={BOX} material={FRAME_MATERIAL} />
      <InstancedParts items={details.glass} geometry={BOX} material={GLASS_MATERIAL} />
      <InstancedParts items={details.awnings} geometry={BOX} material={PANEL_MATERIAL} castShadow />
      <InstancedParts items={details.slabs} geometry={BOX} material={PANEL_MATERIAL} castShadow />
      <InstancedParts items={details.rails} geometry={BOX} material={PANEL_MATERIAL} />
    </>
  );
}

export default memo(BuildingsImpl);
