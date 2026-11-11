import type { CategoryId } from './categories';

/**
 * Hero diagram geometry.
 *
 * WIDE (768px and up): a 640×440 viewBox. The photo sits in the middle, two
 * trunks run beside it, and each node is pinned to an anchor point. Nodes are
 * HTML, positioned by percentage so they line up with the SVG at any width;
 * a node grows away from its anchor, so label length never moves a connector.
 *
 * NARROW (under 768px): a 144×304 px strip. Photo on the left, one trunk,
 * six 44px node rows with an 8px gap (52px pitch) to the right.
 */

export const WIDE = { w: 640, h: 440 } as const;

/** Elbow radius, matching the 12px node radius. */
const R = 12;

/** The hero artwork box, matching its 1000×860 canvas, centred on (320, 220). */
export const PHOTO = { x: 200, y: 117, w: 240, h: 206 } as const;
const PORT_Y = PHOTO.y + PHOTO.h / 2; // 220
/**
 * The artwork is a brush stroke on a transparent canvas. At mid-height the paint
 * starts 7.8% in from the left and ends 12.7% in from the right, so the
 * connectors start there, not at the empty box.
 */
export const PHOTO_EDGE = { left: 0.078, right: 0.127 } as const;
const LEFT_PORT = PHOTO.x + Math.round(PHOTO.w * PHOTO_EDGE.left); // 219
const RIGHT_PORT = PHOTO.x + PHOTO.w - Math.round(PHOTO.w * PHOTO_EDGE.right); // 410
/** Where the connectors leave the photo: its left and right edge midpoints. */
export const PHOTO_PORTS = [
  { x: LEFT_PORT, y: PORT_Y },
  { x: RIGHT_PORT, y: PORT_Y },
] as const;
const TRUNK_L = 192;
const TRUNK_R = 448;
const TOP_Y = 62;
const BOTTOM_Y = 378;

/** Which side of the node touches the connector. */
export type Anchor = 'above' | 'below' | 'left' | 'right';

export interface NodePlacement {
  /** Anchor point in viewBox units. */
  x: number;
  y: number;
  /** Where the node sits relative to the anchor. */
  place: Anchor;
  path: string;
}

export const WIDE_LAYOUT: Record<CategoryId, NodePlacement> = {
  cloud: {
    x: TRUNK_L,
    y: TOP_Y,
    place: 'above',
    path: `M${LEFT_PORT} ${PORT_Y} H${TRUNK_L + R} Q${TRUNK_L} ${PORT_Y} ${TRUNK_L} ${PORT_Y - R} V${TOP_Y}`,
  },
  security: {
    x: 156,
    y: PORT_Y,
    place: 'left',
    path: `M${LEFT_PORT} ${PORT_Y} H156`,
  },
  web: {
    x: TRUNK_L,
    y: BOTTOM_Y,
    place: 'below',
    path: `M${LEFT_PORT} ${PORT_Y} H${TRUNK_L + R} Q${TRUNK_L} ${PORT_Y} ${TRUNK_L} ${PORT_Y + R} V${BOTTOM_Y}`,
  },
  ai: {
    x: TRUNK_R,
    y: TOP_Y,
    place: 'above',
    path: `M${RIGHT_PORT} ${PORT_Y} H${TRUNK_R - R} Q${TRUNK_R} ${PORT_Y} ${TRUNK_R} ${PORT_Y - R} V${TOP_Y}`,
  },
  data: {
    x: 484,
    y: PORT_Y,
    place: 'right',
    path: `M${RIGHT_PORT} ${PORT_Y} H484`,
  },
  automation: {
    x: TRUNK_R,
    y: BOTTOM_Y,
    place: 'below',
    path: `M${RIGHT_PORT} ${PORT_Y} H${TRUNK_R - R} Q${TRUNK_R} ${PORT_Y} ${TRUNK_R} ${PORT_Y + R} V${BOTTOM_Y}`,
  },
};

export const pct = (value: number, of: number) => `${((value / of) * 100).toFixed(3)}%`;

/* ---------- narrow layout ---------- */

export const NARROW = {
  w: 144,
  h: 304,
  photoW: 120,
  photoH: 148,
  pitch: 52,
  row: 44,
} as const;

// The artwork is contained in the 120×148 box: 120×103, vertically centred on y 74.
export const N_PORT_X = NARROW.photoW - Math.round(NARROW.photoW * PHOTO_EDGE.right); // 105
export const N_PORT_Y = 74; // centre of row 1, so the second node is a straight line
const N_TRUNK = 132;
const N_END = NARROW.w; // 144

/** Path from the photo's right edge to the left edge of node row `i`. */
export const narrowPath = (i: number): string => {
  const y = NARROW.row / 2 + i * NARROW.pitch;
  if (y === N_PORT_Y) return `M${N_PORT_X} ${N_PORT_Y} H${N_END}`;
  const dir = y < N_PORT_Y ? -1 : 1;
  return [
    `M${N_PORT_X} ${N_PORT_Y}`,
    `Q${N_TRUNK} ${N_PORT_Y} ${N_TRUNK} ${N_PORT_Y + dir * R}`,
    `V${y - dir * R}`,
    `Q${N_TRUNK} ${y} ${N_TRUNK + R} ${y}`,
    `H${N_END}`,
  ].join(' ');
};
