// A* over the road graph. The grid graph is only a few hundred nodes, so a
// single search is sub-millisecond; callers still throttle repaths (see
// police.ts) and process them through a per-frame budget queue.

import { RoadGraph } from "../city/graph";

function heuristic(g: RoadGraph, a: number, b: number): number {
  const pa = g.nodes[a].pos, pb = g.nodes[b].pos;
  return Math.hypot(pb.x - pa.x, pb.z - pa.z);
}

/** Returns the node path from `start` to `goal`, or [] if unreachable. */
export function findPath(g: RoadGraph, start: number, goal: number): number[] {
  if (start === goal) return [start];
  const open = new Set<number>([start]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>([[start, 0]]);
  const fScore = new Map<number, number>([[start, heuristic(g, start, goal)]]);

  while (open.size) {
    let current = -1, best = Infinity;
    for (const n of open) {
      const f = fScore.get(n) ?? Infinity;
      if (f < best) { best = f; current = n; }
    }
    if (current === goal) {
      const path = [current];
      while (cameFrom.has(current)) { current = cameFrom.get(current)!; path.unshift(current); }
      return path;
    }
    open.delete(current);
    for (const eid of g.nodes[current].edges) {
      const edge = g.edges[eid];
      const tentative = (gScore.get(current) ?? Infinity) + edge.length;
      if (tentative < (gScore.get(edge.to) ?? Infinity)) {
        cameFrom.set(edge.to, current);
        gScore.set(edge.to, tentative);
        fScore.set(edge.to, tentative + heuristic(g, edge.to, goal));
        open.add(edge.to);
      }
    }
  }
  return [];
}
