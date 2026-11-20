// Police pursuit: graph A* when out of sight, direct pursuit steering when
// the player is visible. Repaths are throttled so pathfinding never spikes
// the frame; line-of-sight checks are throttled raycasts against building
// AABBs done by the renderer.

import { RoadGraph, Vec2 } from "../city/graph";
import { findPath } from "./astar";

const REPATH_INTERVAL = 0.7; // seconds between repaths
const LOS_RANGE = 60;

export interface Cop {
  pos: Vec2;
  nodePath: number[];
  repathTimer: number;
  lastKnown: Vec2 | null;
  hasLineOfSight: boolean;
}

export function createCop(pos: Vec2): Cop {
  return { pos, nodePath: [], repathTimer: 0, lastKnown: null, hasLineOfSight: false };
}

function dist(a: Vec2, b: Vec2) { return Math.hypot(b.x - a.x, b.z - a.z); }

/** Nearest graph node to a world position. */
export function nearestNode(g: RoadGraph, pos: Vec2): number {
  let best = 0, bestD = Infinity;
  for (const n of g.nodes) { const d = dist(pos, n.pos); if (d < bestD) { bestD = d; best = n.id; } }
  return best;
}

/**
 * Update pursuit state. With line of sight, the vehicle controller steers
 * straight at the player's predicted position; without it, the cop follows
 * the A* node path to the last known position and searches from there.
 */
export function updateCop(g: RoadGraph, cop: Cop, player: Vec2, losClear: boolean, dt: number): void {
  cop.hasLineOfSight = losClear && dist(cop.pos, player) < LOS_RANGE;
  if (cop.hasLineOfSight) cop.lastKnown = { x: player.x, z: player.z };

  cop.repathTimer -= dt;
  const target = cop.hasLineOfSight ? player : cop.lastKnown;
  if (target && cop.repathTimer <= 0) {
    cop.nodePath = findPath(g, nearestNode(g, cop.pos), nearestNode(g, target));
    cop.repathTimer = REPATH_INTERVAL;
  }
}
