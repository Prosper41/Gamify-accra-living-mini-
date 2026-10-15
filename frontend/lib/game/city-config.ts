import type { Destination } from "./types";

/* -------------------------------------------------------------------------- */
/*  Gameplay constants (unchanged from the original CityWorld.tsx)             */
/* -------------------------------------------------------------------------- */

export const PICKUP: Readonly<Destination> = { x: 0, z: 0 };
export const DEFAULT_DESTINATION: Readonly<Destination> = { x: 15, z: 15 };
export const INTERACTION_RADIUS = 3;
export const PLAYER_SPEED = 7;
export const PLAYER_RADIUS = 0.5;
export const PLAYABLE_BOUND = 24;

/** Camera sits at this offset from the player (same screen-aligned WASD mapping as before). */
export const CAMERA_OFFSET = { x: 0, y: 21, z: 21 } as const;

/* -------------------------------------------------------------------------- */
/*  Road geometry                                                              */
/* -------------------------------------------------------------------------- */

export const ROAD_HALF = 4.5; // asphalt is 9 wide
export const SIDEWALK_OUTER = 6.0;
export const DRAIN_OUTER = 6.6;
export const WORLD_EXTENT = 40;

/* -------------------------------------------------------------------------- */
/*  Palette                                                                    */
/* -------------------------------------------------------------------------- */

export const PALETTE = {
  grass: "#79b36c",
  asphalt: "#363d47",
  sidewalk: "#d3ccbc",
  curb: "#ebe7dc",
  concrete: "#c9cfcb",
  drain: "#2a2f35",
  drainCover: "#a2a9a8",
  lineYellow: "#f5c542",
  lineWhite: "#f3f3ee",
  metal: "#4b5563",
  skyTop: "#4aa8e8",
  skyHorizon: "#dcefe9",
  fog: "#d7ece8",
  ghanaRed: "#ce1126",
  ghanaGold: "#fcd116",
  ghanaGreen: "#006b3f",
} as const;

export type DistrictId = "osu" | "eastLegon" | "circle" | "labadi";

export interface DistrictDef {
  id: DistrictId;
  name: string;
  /** quadrant signs: +1 / -1 on x and z */
  sx: 1 | -1;
  sz: 1 | -1;
  ground: string;
}

export const DISTRICTS: readonly DistrictDef[] = [
  { id: "osu", name: "Osu", sx: -1, sz: -1, ground: "#d8bf8f" },
  { id: "eastLegon", name: "East Legon", sx: 1, sz: -1, ground: "#5fa85b" },
  { id: "circle", name: "Circle", sx: -1, sz: 1, ground: "#b3b9b4" },
  { id: "labadi", name: "Labadi Plaza", sx: 1, sz: 1, ground: "#86bd78" },
];

/* -------------------------------------------------------------------------- */
/*  Buildings                                                                  */
/* -------------------------------------------------------------------------- */

export type Facing = "+z" | "-z" | "+x" | "-x";
export type BuildingKind = "shop" | "apartment" | "villa" | "office";
export type ShopType = "provision" | "restaurant" | "momo" | "pharmacy" | "supermarket" | "cafe";

/** Yaw that turns a building's local +z (its front) towards the given facing. */
export const FACING_YAW: Record<Facing, number> = {
  "+z": 0,
  "-z": Math.PI,
  "+x": Math.PI / 2,
  "-x": -Math.PI / 2,
};

export const FACING_DIR: Record<Facing, readonly [number, number]> = {
  "+z": [0, 1],
  "-z": [0, -1],
  "+x": [1, 0],
  "-x": [-1, 0],
};

export interface BuildingDef {
  id: string;
  kind: BuildingKind;
  shop?: ShopType;
  district: DistrictId;
  /** centre of the footprint */
  x: number;
  z: number;
  /** width along the facade, depth away from it, total height */
  w: number;
  d: number;
  h: number;
  facing: Facing;
  wall: string;
  accent: string;
  roof?: "flat" | "hip";
  roofColor?: string;
  /** walled front yard depth (villas) */
  yard?: number;
  sign?: { text: string; bg: string; fg: string };
  awning?: readonly [string, string];
  roofSign?: { text: string; bg: string };
}

/**
 * Lots sit at least 7.2 units from either road axis, so sidewalks (to 6.0) and
 * drains (to 6.6) stay clear. The pickup (0,0) is the junction and the default
 * destination (15,15) is the centre of the Labadi plaza; both stay open.
 */
export const BUILDINGS: readonly BuildingDef[] = [
  /* Osu: warm, busy, colourful street-front shops */
  {
    id: "osu-provision", kind: "shop", shop: "provision", district: "osu",
    x: -11, z: -10.2, w: 7, d: 5.4, h: 6.4, facing: "+z",
    wall: "#f2c27b", accent: "#c2410c",
    sign: { text: "ADWOA'S PROVISION SHOP", bg: "#166534", fg: "#ffffff" },
    awning: ["#166534", "#fef3c7"],
  },
  {
    id: "osu-chop-bar", kind: "shop", shop: "restaurant", district: "osu",
    x: -19.6, z: -10.2, w: 8, d: 5.4, h: 6.8, facing: "+z",
    wall: "#ec9f86", accent: "#7f1d1d",
    sign: { text: "AUNTY ESI'S CHOP BAR", bg: "#b91c1c", fg: "#fff7ed" },
    awning: ["#b91c1c", "#fff7ed"],
  },
  {
    id: "osu-apartments", kind: "apartment", district: "osu",
    x: -10.2, z: -19, w: 9, d: 6, h: 13.6, facing: "+x",
    wall: "#7cc6c0", accent: "#f8fafc",
    roofSign: { text: "OSU", bg: "#ea580c" },
  },

  /* East Legon: walled villas, calm lawns, palms */
  {
    id: "el-villa-1", kind: "villa", district: "eastLegon",
    x: 11, z: -11.3, w: 8, d: 5.6, h: 6.8, facing: "+z",
    wall: "#f8f5ee", accent: "#e7e0d0", roof: "hip", roofColor: "#b4532a", yard: 1.3,
  },
  {
    id: "el-villa-2", kind: "villa", district: "eastLegon",
    x: 21, z: -11.3, w: 7, d: 5.6, h: 6.4, facing: "+z",
    wall: "#efe3cf", accent: "#d9cbb0", roof: "hip", roofColor: "#475569", yard: 1.3,
  },
  {
    id: "el-heights", kind: "apartment", district: "eastLegon",
    x: 10.2, z: -19.5, w: 9, d: 6, h: 15.6, facing: "-x",
    wall: "#e8edf2", accent: "#0f766e",
    roofSign: { text: "EAST LEGON", bg: "#0f766e" },
  },
  {
    id: "el-villa-3", kind: "villa", district: "eastLegon",
    x: 20, z: -20.5, w: 7, d: 5.5, h: 7.2, facing: "+z",
    wall: "#d3dbe2", accent: "#334155", roof: "flat", roofColor: "#334155", yard: 1.3,
  },

  /* Circle: commercial interchange, glass tower, pharmacy, supermarket */
  {
    id: "circle-pharmacy", kind: "shop", shop: "pharmacy", district: "circle",
    x: -10.5, z: 9.7, w: 6, d: 5, h: 6.4, facing: "-z",
    wall: "#e4f2e6", accent: "#15803d",
    sign: { text: "LIFELINE PHARMACY", bg: "#15803d", fg: "#ffffff" },
    awning: ["#15803d", "#f0fdf4"],
  },
  {
    id: "circle-supermarket", kind: "shop", shop: "supermarket", district: "circle",
    x: -19.8, z: 10.45, w: 9, d: 6.5, h: 7, facing: "-z",
    wall: "#fbe3a1", accent: "#1d4ed8",
    sign: { text: "SIKA SUPERMARKET", bg: "#1d4ed8", fg: "#fef9c3" },
    awning: ["#1d4ed8", "#ffffff"],
  },
  {
    id: "circle-momo", kind: "shop", shop: "momo", district: "circle",
    x: -14.4, z: 8.1, w: 1.6, d: 1.8, h: 2.9, facing: "-z",
    wall: "#facc15", accent: "#1e3a8a",
    sign: { text: "MOMO", bg: "#1e3a8a", fg: "#fde047" },
  },
  {
    id: "circle-tower", kind: "office", district: "circle",
    x: -10.2, z: 19.5, w: 8, d: 6, h: 18.6, facing: "+x",
    wall: "#334155", accent: "#64748b",
    roofSign: { text: "CIRCLE", bg: "#0e7490" },
  },

  /* Labadi plaza: cafe and flats frame the open plaza around (15, 15) */
  {
    id: "labadi-cafe", kind: "shop", shop: "cafe", district: "labadi",
    x: 10.5, z: 9.7, w: 6, d: 5, h: 6.4, facing: "-z",
    wall: "#e9c9b8", accent: "#0e7490",
    sign: { text: "LABADI BREEZE CAFE", bg: "#0e7490", fg: "#ffffff" },
    awning: ["#0e7490", "#ecfeff"],
  },
  {
    id: "labadi-flats", kind: "apartment", district: "labadi",
    x: 22, z: 20, w: 7, d: 5, h: 10.4, facing: "-x",
    wall: "#f2b8a2", accent: "#fff7ed",
  },
];

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Axis-aligned footprint, including any walled front yard. */
export function getBuildingBounds(b: BuildingDef): Bounds {
  const swap = b.facing === "+x" || b.facing === "-x";
  const hx = (swap ? b.d : b.w) / 2;
  const hz = (swap ? b.w : b.d) / 2;
  const bounds: Bounds = { minX: b.x - hx, maxX: b.x + hx, minZ: b.z - hz, maxZ: b.z + hz };
  const ext = b.yard ? b.yard + 0.2 : 0;
  if (ext > 0) {
    if (b.facing === "+z") bounds.maxZ += ext;
    if (b.facing === "-z") bounds.minZ -= ext;
    if (b.facing === "+x") bounds.maxX += ext;
    if (b.facing === "-x") bounds.minX -= ext;
  }
  return bounds;
}

/* -------------------------------------------------------------------------- */
/*  Vegetation                                                                 */
/* -------------------------------------------------------------------------- */

export interface TreeDef {
  x: number;
  z: number;
  scale: number;
  kind: "broad" | "palm";
}

export const TREES: readonly TreeDef[] = [
  // Osu garden
  { x: -16.5, z: -20.5, scale: 1.1, kind: "broad" },
  { x: -22, z: -20, scale: 1.0, kind: "broad" },
  { x: -20.5, z: -23, scale: 0.9, kind: "broad" },
  { x: -14.8, z: -16.5, scale: 1.0, kind: "broad" },
  // East Legon palms
  { x: 16.2, z: -11, scale: 1.1, kind: "palm" },
  { x: 14.0, z: -17.2, scale: 1.0, kind: "palm" },
  { x: 22.8, z: -15.0, scale: 1.0, kind: "palm" },
  // Circle
  { x: -16.5, z: 16, scale: 1.0, kind: "broad" },
  { x: -15, z: 20.8, scale: 1.0, kind: "broad" },
  { x: -21, z: 22.5, scale: 1.1, kind: "broad" },
  // Labadi plaza
  { x: 9.5, z: 17.2, scale: 1.1, kind: "broad" },
  { x: 11, z: 22, scale: 1.0, kind: "broad" },
  { x: 16.5, z: 22.5, scale: 1.2, kind: "broad" },
  { x: 22, z: 11.5, scale: 1.0, kind: "palm" },
  { x: 19, z: 9.2, scale: 1.0, kind: "broad" },
];

export const PLAZA = { x: 15, z: 15, radius: 4.3 } as const;

/* -------------------------------------------------------------------------- */
/*  Street furniture                                                           */
/* -------------------------------------------------------------------------- */

export interface StreetlightDef {
  x: number;
  z: number;
  /** yaw so the arm points over the road */
  ry: number;
}

function buildStreetlights(): StreetlightDef[] {
  const lights: StreetlightDef[] = [];
  for (const s of [-1, 1]) {
    for (const d of [-22, -14, 14, 22]) {
      lights.push({ x: d, z: s * 5.6, ry: s > 0 ? Math.PI / 2 : -Math.PI / 2 });
      lights.push({ x: s * 5.6, z: d, ry: s > 0 ? Math.PI : 0 });
    }
  }
  return lights;
}

export const STREETLIGHTS: readonly StreetlightDef[] = buildStreetlights();

export interface SignDef {
  kind: "speed" | "name";
  x: number;
  z: number;
  text: string;
}

export const SIGNS: readonly SignDef[] = [
  { kind: "speed", x: 17.5, z: -5.8, text: "40" },
  { kind: "speed", x: -17.5, z: 5.8, text: "40" },
  { kind: "name", x: -5.7, z: -11.4, text: "OXFORD ST." },
  { kind: "name", x: 5.7, z: 11.4, text: "LIBERATION RD." },
];

export interface BillboardDef {
  x: number;
  z: number;
  w: number;
  title: string;
  sub: string;
  bg: string;
  fg: string;
}

export const BILLBOARDS: readonly BillboardDef[] = [
  { x: -19.5, z: -15.8, w: 5.2, title: "GYE NYAME BANK", sub: "Save the Ghanaian way", bg: "#1e3a8a", fg: "#fcd34d" },
  { x: 17, z: -15.8, w: 5.2, title: "ZOOM TELECOM", sub: "Data for the whole family", bg: "#be123c", fg: "#ffffff" },
  { x: -20, z: 17.5, w: 5, title: "FRESH FM 99.5", sub: "Accra's morning show", bg: "#0f766e", fg: "#ffffff" },
];

export interface BenchDef {
  x: number;
  z: number;
  /** yaw; the seat faces local +z */
  ry: number;
}

export const BENCHES: readonly BenchDef[] = [
  { x: 15, z: 9.8, ry: 0 },
  { x: 15, z: 20.2, ry: Math.PI },
  { x: 9.8, z: 15, ry: Math.PI / 2 },
  { x: 20.2, z: 15, ry: -Math.PI / 2 },
  { x: -19.5, z: -19.8, ry: 0 },
];

export const BINS: readonly { x: number; z: number }[] = [
  { x: 5.8, z: -12 },
  { x: -5.8, z: 12.5 },
  { x: 12, z: 5.8 },
  { x: -12, z: -5.8 },
];

/* -------------------------------------------------------------------------- */
/*  Vehicles                                                                   */
/* -------------------------------------------------------------------------- */

export type CarKind = "sedan" | "taxi" | "tro-tro";

export interface CarDef {
  x: number;
  z: number;
  /** yaw: 0 puts the long axis along X, PI/2 along Z */
  heading: number;
  kind: CarKind;
  color: string;
}

export const CAR_SPECS: Record<CarKind, { length: number; bodyH: number; glassL: number; glassH: number; glassOffset: number; wheelBase: number }> = {
  sedan: { length: 4.2, bodyH: 0.75, glassL: 2.2, glassH: 0.6, glassOffset: -0.15, wheelBase: 1.35 },
  taxi: { length: 4.2, bodyH: 0.75, glassL: 2.2, glassH: 0.6, glassOffset: -0.15, wheelBase: 1.35 },
  "tro-tro": { length: 5, bodyH: 1.0, glassL: 3.8, glassH: 0.85, glassOffset: 0, wheelBase: 1.6 },
};

export const CAR_WIDTH = 1.9;

export const CARS: readonly CarDef[] = [
  { x: -13.5, z: 3.0, heading: 0, kind: "sedan", color: "#e11d48" },
  { x: -21.5, z: 3.0, heading: 0, kind: "tro-tro", color: "#f1f5f9" },
  { x: 13.5, z: -3.0, heading: Math.PI, kind: "taxi", color: "#facc15" },
  { x: 22, z: -3.0, heading: Math.PI, kind: "sedan", color: "#2563eb" },
  { x: 3.0, z: -13.5, heading: Math.PI / 2, kind: "sedan", color: "#94a3b8" },
  { x: 3.0, z: -21.5, heading: Math.PI / 2, kind: "taxi", color: "#facc15" },
  { x: -3.0, z: 14.5, heading: -Math.PI / 2, kind: "sedan", color: "#f8fafc" },
  { x: -3.0, z: 22.5, heading: -Math.PI / 2, kind: "tro-tro", color: "#fde68a" },
];

export function getCarBounds(car: CarDef): Bounds {
  const spec = CAR_SPECS[car.kind];
  const c = Math.abs(Math.cos(car.heading));
  const s = Math.abs(Math.sin(car.heading));
  const hx = (c * spec.length + s * CAR_WIDTH) / 2;
  const hz = (s * spec.length + c * CAR_WIDTH) / 2;
  return { minX: car.x - hx, maxX: car.x + hx, minZ: car.z - hz, maxZ: car.z + hz };
}
