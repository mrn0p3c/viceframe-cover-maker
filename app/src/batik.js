// Batik pattern tiles, drawn entirely in code: mega mendung cloud bands, parang diagonal
// blades and kawung four-petal flowers. Each maker returns a small offscreen canvas that
// callers tile with createPattern, so the motifs can dress panel borders, title bands and
// photo overlays without any image files.

/** A tiny deterministic random source, so a pattern looks the same on every render. */
export function seededRandom(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tileCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  return c;
}

/** One scalloped mega mendung cloud outline: a row of nested arcs like a breaking wave. */
function mendungCloud(ctx, x, y, r, fill, stroke, lw) {
  ctx.beginPath();
  ctx.moveTo(x - r * 1.7, y + r * 0.55);
  ctx.arc(x - r * 0.95, y + r * 0.1, r * 0.62, Math.PI * 0.95, Math.PI * 1.95);
  ctx.arc(x - r * 0.1, y - r * 0.28, r * 0.78, Math.PI * 1.05, Math.PI * 2.05);
  ctx.arc(x + r * 0.8, y + r * 0.05, r * 0.6, Math.PI * 1.1, Math.PI * 0.35);
  ctx.lineTo(x + r * 1.7, y + r * 0.55);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

/** Mega mendung tile: stacked cloud bands in deepening indigo, edged in pale gold. */
export function megaMendungTile(size = 192, dark = '#131c4e', mid = '#27409b', light = '#5f7fd9', edge = '#e8c877') {
  const c = tileCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, size, size);
  const band = size / 3;
  const shades = [mid, light, mid];
  for (let row = 0; row < 3; row++) {
    const y = row * band + band * 0.72;
    const off = row % 2 ? size / 4 : 0;
    for (let i = -1; i < 3; i++) {
      const x = off + i * (size / 2) + size / 4;
      mendungCloud(ctx, x, y, band * 0.52, shades[row], edge, Math.max(1.5, size / 90));
      mendungCloud(ctx, x, y, band * 0.34, row === 1 ? mid : light, dark, Math.max(1, size / 140));
    }
  }
  return c;
}

/** Kawung tile: four ellipses petals around each grid point, gold on deep indigo-brown. */
export function kawungTile(size = 160, back = '#2a1c3f', petal = '#c9973f', line = '#e8c877') {
  const c = tileCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = back;
  ctx.fillRect(0, 0, size, size);
  const step = size / 2;
  const r = step * 0.52;
  ctx.lineWidth = Math.max(1.2, size / 110);
  for (let gy = -1; gy < 3; gy++) {
    for (let gx = -1; gx < 3; gx++) {
      const cx = gx * step + (gy % 2 ? step / 2 : 0);
      const cy = gy * step;
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.62, r * 0.3, a, 0, Math.PI * 2);
        ctx.fillStyle = petal;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = line;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = line;
      ctx.fill();
    }
  }
  return c;
}

/** Parang tile: diagonal rows of interlocking blade/teardrop shapes, gold on indigo. */
export function parangTile(size = 192, back = '#1b2350', blade = '#b98a34', line = '#e8c877') {
  const c = tileCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = back;
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.translate(-size, -size);
  const step = size / 3;
  ctx.lineWidth = Math.max(1.2, size / 120);
  for (let row = 0; row < 7; row++) {
    for (let i = 0; i < 7; i++) {
      const x = i * step + (row % 2 ? step / 2 : 0);
      const y = row * step;
      ctx.beginPath();
      ctx.moveTo(x, y - step * 0.42);
      ctx.bezierCurveTo(x + step * 0.5, y - step * 0.3, x + step * 0.42, y + step * 0.28, x, y + step * 0.46);
      ctx.bezierCurveTo(x - step * 0.42, y + step * 0.28, x - step * 0.5, y - step * 0.3, x, y - step * 0.42);
      ctx.fillStyle = blade;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = line;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, step * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = line;
      ctx.fill();
    }
  }
  ctx.restore();
  return c;
}

const tileCache = new Map();

/** Cached pattern tile by kind ('mendung' | 'kawung' | 'parang'). */
export function batikTile(kind) {
  if (!tileCache.has(kind)) {
    tileCache.set(kind, kind === 'kawung' ? kawungTile() : kind === 'parang' ? parangTile() : megaMendungTile());
  }
  return tileCache.get(kind);
}

/** Fills a rect with a batik pattern at a given scale and strength. */
export function fillBatik(ctx, kind, x, y, w, h, scale = 1, alpha = 1) {
  const tile = batikTile(kind);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (!pattern) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w / scale, h / scale);
  ctx.restore();
}

/** A horizontal mega mendung band across a sky: layered cloud rows fading into the horizon. */
export function drawMendungSky(ctx, x, y, w, h, dark, mid, light, edge) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const rows = 4;
  const bandH = h / rows;
  const fills = [light, mid, light, mid];
  for (let row = 0; row < rows; row++) {
    const cy = y + row * bandH + bandH * 0.85;
    const r = bandH * 0.62;
    const step = r * 2.1;
    const off = row % 2 ? step / 2 : 0;
    for (let cx = x - step + off; cx < x + w + step; cx += step) {
      mendungCloud(ctx, cx, cy, r, fills[row], edge, Math.max(1.2, h / 260));
    }
  }
  ctx.restore();
}
