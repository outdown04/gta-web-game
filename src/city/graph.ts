// Road graph for the procedural city.
// Intersections are nodes; lanes are directed edges carrying a polyline.

export interface Vec2 { x: number; z: number }

export interface RoadNode {
  id: number;
  pos: Vec2;
  edges: number[]; // outgoing edge ids
}

export interface RoadEdge {
  id: number;
  from: number;
  to: number;
  lane: Vec2[]; // polyline the cars follow (right-hand traffic offset)
  length: number;
}

export interface RoadGraph {
  nodes: RoadNode[];
  edges: RoadEdge[];
}

const LANE_OFFSET = 2.2; // metres from road centre to lane centre

function offsetLane(a: Vec2, b: Vec2): Vec2[] {
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  const nx = -dz / len, nz = dx / len; // right-hand normal
  return [
    { x: a.x + nx * LANE_OFFSET, z: a.z + nz * LANE_OFFSET },
    { x: b.x + nx * LANE_OFFSET, z: b.z + nz * LANE_OFFSET },
  ];
}

/** Build a grid city graph: blocksX × blocksZ blocks of `block` metres. */
export function buildGridGraph(blocksX: number, blocksZ: number, block = 40): RoadGraph {
  const nodes: RoadNode[] = [];
  const edges: RoadEdge[] = [];
  const id = (i: number, j: number) => j * (blocksX + 1) + i;

  for (let j = 0; j <= blocksZ; j++)
    for (let i = 0; i <= blocksX; i++)
      nodes.push({ id: id(i, j), pos: { x: i * block, z: j * block }, edges: [] });

  const addEdge = (from: number, to: number) => {
    const a = nodes[from].pos, b = nodes[to].pos;
    const lane = offsetLane(a, b);
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    const e: RoadEdge = { id: edges.length, from, to, lane, length };
    edges.push(e);
    nodes[from].edges.push(e.id);
  };

  for (let j = 0; j <= blocksZ; j++)
    for (let i = 0; i <= blocksX; i++) {
      if (i < blocksX) { addEdge(id(i, j), id(i + 1, j)); addEdge(id(i + 1, j), id(i, j)); }
      if (j < blocksZ) { addEdge(id(i, j), id(i, j + 1)); addEdge(id(i, j + 1), id(i, j)); }
    }
  return { nodes, edges };
}
