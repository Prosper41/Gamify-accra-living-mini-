import {
  BILLBOARDS,
  BUILDINGS,
  CARS,
  DEFAULT_DESTINATION,
  DRAIN_OUTER,
  PICKUP,
  PLAYER_RADIUS,
  TREES,
  getBuildingBounds,
  getCarBounds,
  type Bounds,
} from "./city-config";
import type { Destination } from "./types";

export interface Collider extends Bounds {
  kind: "building" | "tree" | "car" | "billboard";
}

function buildStaticColliders(): Collider[] {
  const colliders: Collider[] = [];

  for (const b of BUILDINGS) colliders.push({ ...getBuildingBounds(b), kind: "building" });

  for (const t of TREES) {
    const r = 0.35 * t.scale;
    colliders.push({ minX: t.x - r, maxX: t.x + r, minZ: t.z - r, maxZ: t.z + r, kind: "tree" });
  }

  for (const c of CARS) colliders.push({ ...getCarBounds(c), kind: "car" });

  for (const bb of BILLBOARDS) {
    colliders.push({
      minX: bb.x - bb.w / 2,
      maxX: bb.x + bb.w / 2,
      minZ: bb.z - 0.4,
      maxZ: bb.z + 0.4,
      kind: "billboard",
    });
  }

  return colliders;
}

export const STATIC_COLLIDERS: readonly Collider[] = buildStaticColliders();

export function distanceToBounds(x: number, z: number, b: Bounds): number {
  const dx = Math.max(b.minX - x, 0, x - b.maxX);
  const dz = Math.max(b.minZ - z, 0, z - b.maxZ);
  return Math.hypot(dx, dz);
}

/**
 * Drops every collider within `clearRadius` of any protected point, so a
 * delivery target (including a destination sent by the backend at runtime)
 * can never be sealed off by scenery.
 */
export function filterColliders(
  colliders: readonly Collider[],
  protectedPoints: readonly Destination[],
  clearRadius: number
): Collider[] {
  return colliders.filter((c) =>
    protectedPoints.every((p) => distanceToBounds(p.x, p.z, c) >= clearRadius)
  );
}

/** Pushes a circle out of every overlapping box. Mutates and returns `pos`. */
export function resolveCircle(
  pos: { x: number; z: number },
  radius: number,
  colliders: readonly Collider[]
): { x: number; z: number } {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of colliders) {
      const nx = Math.min(Math.max(pos.x, c.minX), c.maxX);
      const nz = Math.min(Math.max(pos.z, c.minZ), c.maxZ);
      const dx = pos.x - nx;
      const dz = pos.z - nz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= radius * radius) continue;

      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        const push = (radius - d) / d;
        pos.x += dx * push;
        pos.z += dz * push;
      } else {
        // centre is inside the box: leave through the shallowest side
        const left = pos.x - c.minX;
        const right = c.maxX - pos.x;
        const up = pos.z - c.minZ;
        const down = c.maxZ - pos.z;
        const m = Math.min(left, right, up, down);
        if (m === left) pos.x = c.minX - radius;
        else if (m === right) pos.x = c.maxX + radius;
        else if (m === up) pos.z = c.minZ - radius;
        else pos.z = c.maxZ + radius;
      }
    }
  }
  return pos;
}

/**
 * Development check run once by CityWorld. Returns human-readable problems:
 * blocked delivery points, overlapping scenery, or scenery on the road corridor.
 */
export function validateCityLayout(extraTargets: readonly Destination[] = []): string[] {
  const problems: string[] = [];
  const targets = [PICKUP, DEFAULT_DESTINATION, ...extraTargets];

  for (const t of targets) {
    for (const c of STATIC_COLLIDERS) {
      if (distanceToBounds(t.x, t.z, c) < PLAYER_RADIUS + 1) {
        problems.push(`${c.kind} collider is too close to delivery point (${t.x}, ${t.z})`);
      }
    }
  }

  for (let i = 0; i < STATIC_COLLIDERS.length; i++) {
    for (let j = i + 1; j < STATIC_COLLIDERS.length; j++) {
      const a = STATIC_COLLIDERS[i];
      const b = STATIC_COLLIDERS[j];
      const overlap = a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
      if (overlap) problems.push(`${a.kind} #${i} overlaps ${b.kind} #${j}`);
    }
  }

  STATIC_COLLIDERS.forEach((c, i) => {
    if (c.kind === "car") return;
    const crossesZRoad = c.minX < DRAIN_OUTER && c.maxX > -DRAIN_OUTER;
    const crossesXRoad = c.minZ < DRAIN_OUTER && c.maxZ > -DRAIN_OUTER;
    if (crossesZRoad || crossesXRoad) problems.push(`${c.kind} #${i} intrudes on a road corridor`);
  });

  return problems;
}
