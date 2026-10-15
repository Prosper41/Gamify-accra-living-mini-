import {
  CARS,
  CAR_SPECS,
  CAR_WIDTH,
  DRAIN_OUTER,
  FACING_YAW,
  PALETTE,
  ROAD_HALF,
  SIDEWALK_OUTER,
  WORLD_EXTENT,
  type BuildingDef,
  type CarDef,
} from "./city-config";
import type { PartInstance } from "./types";

/** Rotates a local offset by `yaw` and adds it to (x, z). Matches three.js rotation.y. */
export function localToWorld(
  x: number,
  z: number,
  yaw: number,
  lx: number,
  ly: number,
  lz: number
): [number, number, number] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [x + lx * c + lz * s, ly, z - lx * s + lz * c];
}

/* -------------------------------------------------------------------------- */
/*  Building facade details (windows, balconies, awnings), all instanced        */
/* -------------------------------------------------------------------------- */

export interface BuildingInstances {
  frames: PartInstance[];
  glass: PartInstance[];
  awnings: PartInstance[];
  slabs: PartInstance[];
  rails: PartInstance[];
}

const WIN_W = 1.1;
const WIN_H = 1.35;
const WIN_SPACING = 2.4;
const FLOOR_H = 2.8;
const GLASS_TINTS = ["#8fd0ea", "#7bc2de", "#a5dcef", "#86c9e4"];

const FACES = [
  { nx: 0, nz: 1, yaw: 0, front: true, alongWidth: true },
  { nx: 0, nz: -1, yaw: Math.PI, front: false, alongWidth: true },
  { nx: 1, nz: 0, yaw: Math.PI / 2, front: false, alongWidth: false },
  { nx: -1, nz: 0, yaw: -Math.PI / 2, front: false, alongWidth: false },
] as const;

function columnOffsets(faceWidth: number): number[] {
  const cols = Math.max(1, Math.floor((faceWidth - 1.2) / WIN_SPACING));
  return Array.from({ length: cols }, (_, i) => (i - (cols - 1) / 2) * WIN_SPACING);
}

export function buildBuildingInstances(buildings: readonly BuildingDef[]): BuildingInstances {
  const out: BuildingInstances = { frames: [], glass: [], awnings: [], slabs: [], rails: [] };
  let tint = 0;

  for (const b of buildings) {
    const yaw = FACING_YAW[b.facing];
    const at = (lx: number, ly: number, lz: number) => localToWorld(b.x, b.z, yaw, lx, ly, lz);
    const isMomo = b.shop === "momo";

    /* Windows / glass bands */
    if (!isMomo) {
      for (const face of FACES) {
        const faceWidth = face.alongWidth ? b.w : b.d;
        const dist = face.alongWidth ? b.d / 2 : b.w / 2;
        const tx = face.nz;
        const tz = -face.nx;

        if (b.kind === "office") {
          for (let f = 0; ; f++) {
            const y = 2.4 + f * 2.9;
            if (y + 0.75 > b.h - 0.6) break;
            if (face.front && f === 0) continue;
            out.glass.push({
              p: at(face.nx * (dist + 0.03), y, face.nz * (dist + 0.03)),
              s: [faceWidth - 0.9, 1.5, 0.08],
              ry: yaw + face.yaw,
              c: GLASS_TINTS[tint++ % GLASS_TINTS.length],
            });
          }
          continue;
        }

        const offsets = columnOffsets(faceWidth);
        for (let f = 0; ; f++) {
          const y = 1.9 + f * FLOOR_H;
          if (y + WIN_H / 2 > b.h - 0.5) break;
          if (face.front && f === 0 && b.kind === "shop") continue;

          offsets.forEach((u, idx) => {
            const isCentre = offsets.length % 2 === 1 && idx === (offsets.length - 1) / 2;
            if (face.front && f === 0 && isCentre) return; // entrance
            const px = face.nx * (dist + 0.02) + tx * u;
            const pz = face.nz * (dist + 0.02) + tz * u;
            out.frames.push({ p: at(px, y, pz), s: [WIN_W + 0.16, WIN_H + 0.16, 0.12], ry: yaw + face.yaw });
            out.glass.push({
              p: at(face.nx * 0.05 + px, y, face.nz * 0.05 + pz),
              s: [WIN_W, WIN_H, 0.08],
              ry: yaw + face.yaw,
              c: GLASS_TINTS[tint++ % GLASS_TINTS.length],
            });
          });
        }
      }
    }

    /* Shop awnings: alternating stripes over the storefront */
    if (b.kind === "shop" && !isMomo && b.awning) {
      const total = b.w * 0.92;
      const n = Math.ceil(total / 0.9);
      const stripe = total / n;
      for (let i = 0; i < n; i++) {
        const u = (i - (n - 1) / 2) * stripe;
        out.awnings.push({
          p: at(u, 2.85, b.d / 2 + 0.7),
          s: [stripe, 0.07, 1.4],
          ry: yaw,
          rx: 0.28,
          c: b.awning[i % 2],
        });
      }
    }

    /* Balconies on the front: every column on apartments, one central on villas */
    if (b.kind === "apartment" || (b.kind === "villa" && b.roof !== "flat")) {
      const offsets = b.kind === "villa" ? [0] : columnOffsets(b.w);
      for (let f = 1; ; f++) {
        const y = 1.9 + f * FLOOR_H;
        if (y + WIN_H / 2 > b.h - 0.5) break;
        for (const u of offsets) {
          const slabY = y - 0.74;
          const z = b.d / 2 + 0.45;
          out.slabs.push({ p: at(u, slabY, z), s: [1.7, 0.14, 0.95], ry: yaw, c: "#e2e8f0" });
          out.rails.push({ p: at(u, slabY + 0.5, z + 0.45), s: [1.7, 0.85, 0.05], ry: yaw, c: "#475569" });
          out.rails.push({ p: at(u - 0.85, slabY + 0.5, z), s: [0.05, 0.85, 0.95], ry: yaw, c: "#475569" });
          out.rails.push({ p: at(u + 0.85, slabY + 0.5, z), s: [0.05, 0.85, 0.95], ry: yaw, c: "#475569" });
        }
      }
    }
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/*  Roads                                                                      */
/* -------------------------------------------------------------------------- */

export interface RoadInstances {
  markings: PartInstance[];
  curbs: PartInstance[];
  drainCovers: PartInstance[];
}

export function buildRoadInstances(): RoadInstances {
  const markings: PartInstance[] = [];
  const curbs: PartInstance[] = [];
  const drainCovers: PartInstance[] = [];
  const Y = 0.075;
  const stripeOffsets = Array.from({ length: 9 }, (_, i) => -3.8 + i * 0.95);
  const edgeCentre = (WORLD_EXTENT + 11) / 2;
  const edgeLength = WORLD_EXTENT - 11;

  for (const s of [-1, 1]) {
    for (const d of [12, 17, 22, 27, 32, 37]) {
      markings.push({ p: [s * d, Y, 0], s: [2.4, 0.02, 0.16], c: PALETTE.lineYellow });
      markings.push({ p: [0, Y, s * d], s: [0.16, 0.02, 2.4], c: PALETTE.lineYellow });
    }

    for (const e of [-1, 1]) {
      markings.push({ p: [s * edgeCentre, Y - 0.005, e * (ROAD_HALF - 0.4)], s: [edgeLength, 0.02, 0.12], c: PALETTE.lineWhite });
      markings.push({ p: [e * (ROAD_HALF - 0.4), Y - 0.005, s * edgeCentre], s: [0.12, 0.02, edgeLength], c: PALETTE.lineWhite });
    }

    for (const o of stripeOffsets) {
      markings.push({ p: [s * 8, Y + 0.005, o], s: [3, 0.02, 0.5], c: PALETTE.lineWhite });
      markings.push({ p: [o, Y + 0.005, s * 8], s: [0.5, 0.02, 3], c: PALETTE.lineWhite });
    }
  }

  // stop lines: right-hand traffic, one lane per approach
  markings.push({ p: [10.2, Y, -2.15], s: [0.4, 0.02, 4], c: PALETTE.lineWhite });
  markings.push({ p: [-10.2, Y, 2.15], s: [0.4, 0.02, 4], c: PALETTE.lineWhite });
  markings.push({ p: [-2.15, Y, -10.2], s: [4, 0.02, 0.4], c: PALETTE.lineWhite });
  markings.push({ p: [2.15, Y, 10.2], s: [4, 0.02, 0.4], c: PALETTE.lineWhite });

  const stripLength = WORLD_EXTENT - ROAD_HALF;
  const stripCentre = ROAD_HALF + stripLength / 2;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      curbs.push({ p: [sx * stripCentre, 0.095, sz * (ROAD_HALF + 0.1)], s: [stripLength, 0.19, 0.2], c: PALETTE.curb });
      curbs.push({ p: [sx * (ROAD_HALF + 0.1), 0.095, sz * stripCentre], s: [0.2, 0.19, stripLength], c: PALETTE.curb });

      for (let i = 0; i < 18; i++) {
        const d = 7.7 + i * 1.8;
        drainCovers.push({
          p: [sx * d, 0.0375, sz * (SIDEWALK_OUTER + 0.3)],
          s: [1.35, 0.075, 0.62],
          c: i % 2 ? "#9aa2a1" : "#adb4b2",
        });
        drainCovers.push({
          p: [sx * (SIDEWALK_OUTER + 0.3), 0.0375, sz * d],
          s: [0.62, 0.075, 1.35],
          c: i % 2 ? "#9aa2a1" : "#adb4b2",
        });
      }
    }
  }

  void DRAIN_OUTER;
  return { markings, curbs, drainCovers };
}

/* -------------------------------------------------------------------------- */
/*  Vehicles                                                                   */
/* -------------------------------------------------------------------------- */

export interface VehicleInstances {
  bodies: PartInstance[];
  glass: PartInstance[];
  roofs: PartInstance[];
  wheels: PartInstance[];
  lights: PartInstance[];
}

export function buildVehicleInstances(cars: readonly CarDef[] = CARS): VehicleInstances {
  const out: VehicleInstances = { bodies: [], glass: [], roofs: [], wheels: [], lights: [] };

  for (const car of cars) {
    const spec = CAR_SPECS[car.kind];
    const yaw = car.heading;
    const at = (lx: number, ly: number, lz: number) => localToWorld(car.x, car.z, yaw, lx, ly, lz);
    const bodyY = 0.3 + spec.bodyH / 2;
    const glassY = 0.3 + spec.bodyH + spec.glassH / 2;

    out.bodies.push({ p: at(0, bodyY, 0), s: [spec.length, spec.bodyH, CAR_WIDTH - 0.05], ry: yaw, c: car.color });
    out.glass.push({ p: at(spec.glassOffset, glassY, 0), s: [spec.glassL, spec.glassH, CAR_WIDTH - 0.2], ry: yaw });
    out.roofs.push({
      p: at(spec.glassOffset, 0.3 + spec.bodyH + spec.glassH + 0.04, 0),
      s: [spec.glassL - 0.15, 0.08, CAR_WIDTH - 0.3],
      ry: yaw,
      c: car.color,
    });
    if (car.kind === "taxi") {
      out.roofs.push({
        p: at(spec.glassOffset, 0.3 + spec.bodyH + spec.glassH + 0.2, 0),
        s: [0.5, 0.18, 0.28],
        ry: yaw,
        c: "#fef9c3",
      });
    }

    for (const wx of [-spec.wheelBase, spec.wheelBase]) {
      for (const wz of [-0.88, 0.88]) {
        out.wheels.push({ p: at(wx, 0.36, wz), s: [0.72, 0.3, 0.72], ry: yaw, rx: Math.PI / 2 });
      }
    }

    for (const lz of [-0.6, 0.6]) {
      out.lights.push({ p: at(spec.length / 2, 0.3 + spec.bodyH * 0.55, lz), s: [0.08, 0.16, 0.35], ry: yaw, c: "#fff6c4" });
      out.lights.push({ p: at(-spec.length / 2, 0.3 + spec.bodyH * 0.55, lz), s: [0.08, 0.16, 0.35], ry: yaw, c: "#dc2626" });
    }
  }

  return out;
}
