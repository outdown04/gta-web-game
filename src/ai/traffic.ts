// Traffic simulation: cars follow lane polylines (no per-car pathfinding).
// Only cars within ACTIVE_RADIUS of the player are simulated; the rest are
// parked in an object pool and recycled. A spatial hash over city blocks
// keeps neighbour lookups cheap and the hot loop allocation-free.

import { RoadGraph, RoadEdge, Vec2 } from "../city/graph";

export const ACTIVE_RADIUS = 90; // ~2 blocks

export class SpatialHash {
  private cells = new Map<string, number[]>();
  constructor(private cellSize = 40) {}
  private key(cx: number, cz: number) { return cx + "," + cz; }
  clear() { this.cells.clear(); }
  insert(index: number, pos: Vec2) {
    const k = this.key(Math.floor(pos.x / this.cellSize), Math.floor(pos.z / this.cellSize));
    let cell = this.cells.get(k);
    if (!cell) { cell = []; this.cells.set(k, cell); }
    cell.push(index);
  }
}

export interface Car {
  active: boolean;
  edge: number;
  dist: number;      // distance travelled along the current edge
  speed: number;
  pos: Vec2;
}

const MAX_CARS = 120;
export const carPool: Car[] = Array.from({ length: MAX_CARS }, () => ({
  active: false, edge: -1, dist: 0, speed: 0, pos: { x: 0, z: 0 },
}));

const _tmp = { x: 0, z: 0 }; // pooled scratch vector — zero per-frame allocation

/** Pick the next edge at an intersection, weighted against U-turns. */
export function pickNextEdge(g: RoadGraph, car: Car, rng: () => number): RoadEdge {
  const current = g.edges[car.edge];
  const node = g.nodes[current.to];
  let total = 0;
  for (const eid of node.edges) total += g.edges[eid].to === current.from ? 0.15 : 1;
  let r = rng() * total;
  for (const eid of node.edges) {
    const e = g.edges[eid];
    r -= e.to === current.from ? 0.15 : 1;
    if (r <= 0) return e;
  }
  return g.edges[node.edges[0]];
}

/** Advance one car along its lane. Call only for cars near the player. */
export function stepCar(g: RoadGraph, car: Car, dt: number, rng: () => number): void {
  car.dist += car.speed * dt;
  let edge = g.edges[car.edge];
  while (car.dist > edge.length) {
    car.dist -= edge.length;
    edge = pickNextEdge(g, car, rng);
    car.edge = edge.id;
  }
  const a = edge.lane[0], b = edge.lane[1];
  const t = edge.length === 0 ? 0 : car.dist / edge.length;
  _tmp.x = a.x + (b.x - a.x) * t;
  _tmp.z = a.z + (b.z - a.z) * t;
  car.pos.x = _tmp.x;
  car.pos.z = _tmp.z;
}
