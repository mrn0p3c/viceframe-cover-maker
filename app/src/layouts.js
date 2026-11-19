// Poster layouts as tiling rectangles in fractions of the cover (0..1), GTA style: a big
// hero panel, smaller scene panels around it, white gutters between everything. The
// renderer insets each rect by half the gutter, so the rects here simply tile the page.
// `hero` marks the panel a photo lands in first and the batik overlay dresses by default.

export const LAYOUTS = {
  classic: {
    label: 'Classic Grid',
    hero: 5,
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 0.27 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.27 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.27 },
      { x: 0, y: 0.27, w: 0.5, h: 0.24 },
      { x: 0.5, y: 0.27, w: 0.5, h: 0.24 },
      { x: 0, y: 0.51, w: 1, h: 0.49 },
    ],
  },
  duo: {
    label: 'Duo Split',
    hero: 0,
    titleBand: true,
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  solo: {
    label: 'Solo Hero',
    hero: 0,
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  wide: {
    label: 'Wide Banner',
    hero: 0,
    panels: [
      { x: 0, y: 0, w: 0.6, h: 1 },
      { x: 0.6, y: 0, w: 0.4, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.5 },
    ],
  },
  collage: {
    label: 'Collage 5',
    hero: 0,
    panels: [
      { x: 0, y: 0, w: 0.55, h: 0.46 },
      { x: 0.55, y: 0, w: 0.45, h: 0.46 },
      { x: 0, y: 0.46, w: 1 / 3, h: 0.54 },
      { x: 1 / 3, y: 0.46, w: 1 / 3, h: 0.54 },
      { x: 2 / 3, y: 0.46, w: 1 / 3, h: 0.54 },
    ],
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** Panel rectangles in pixels for a cover of w x h, inset by the white gutter. */
export function panelRects(layout, w, h, gutter) {
  return layout.panels.map((p) => ({
    x: p.x * w + gutter / 2,
    y: p.y * h + gutter / 2,
    w: p.w * w - gutter,
    h: p.h * h - gutter,
  }));
}
