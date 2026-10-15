export type Position = { x: number; y: number; z: number };

export type Destination = { x: number; z: number };

export type InteractionAction = "pickup" | "complete" | "shop";

/** Compact description of one instance in an InstancedMesh. */
export interface PartInstance {
  /** world position */
  p: [number, number, number];
  /** scale (uniform number or per-axis) */
  s?: number | [number, number, number];
  /** yaw (applied last, around world Y) */
  ry?: number;
  /** pitch around local X */
  rx?: number;
  /** roll around local Z */
  rz?: number;
  /** per-instance colour (multiplies the material colour) */
  c?: string;
}
