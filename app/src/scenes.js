// Procedural cover scenes, drawn in code for panels that hold no photo: Vice City sunset
// skies, a low sun, palm silhouettes, skyline silhouettes, neon signs, a harbour boat —
// and, for the Batik Vice theme, mega mendung cloud bands over an indigo sky. Everything
// is original vector drawing on canvas; no artwork or image files are used.

import { drawMendungSky, seededRandom } from './batik.js';

export const SCENE_KINDS = ['beach', 'skyline', 'palms', 'neon', 'harbour', 'strip'];

function skyGradient(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  stops.forEach((colour, i) => g.addColorStop(i / (stops.length - 1), colour));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function sunDisc(ctx, cx, cy, r, theme) {
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 3.1);
  glow.addColorStop(0, theme.sun);
  glow.addColorStop(0.25, theme.sun + 'aa');
  glow.addColorStop(1, theme.sun + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 3.1, cy - r * 3.1, r * 6.2, r * 6.2);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.sunCore;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = theme.sun;
  ctx.fill();
}

function seaBand(ctx, x, y, w, h, theme, rand) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, theme.sea[0]);
  g.addColorStop(1, theme.sea[1]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, h / 60);
  for (let i = 0; i < 14; i++) {
    const sy = y + rand() * h;
    const sx = x + rand() * w * 0.8;
    ctx.globalAlpha = 0.12 + rand() * 0.3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + w * (0.03 + rand() * 0.09), sy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function skyline(ctx, x, base, w, hMax, colour, rand, windowColour, litChance) {
  let bx = x - w * 0.02;
  ctx.fillStyle = colour;
  while (bx < x + w) {
    const bw = w * (0.045 + rand() * 0.085);
    const bh = hMax * (0.3 + rand() * 0.7);
    ctx.fillRect(bx, base - bh, bw, bh);
    if (rand() < 0.4) ctx.fillRect(bx + bw * 0.3, base - bh - hMax * 0.06, bw * 0.4, hMax * 0.06);
    if (windowColour && litChance > 0) {
      const cols = Math.max(1, Math.floor(bw / (w * 0.022)));
      const rows = Math.max(1, Math.floor(bh / (hMax * 0.11)));
      ctx.fillStyle = windowColour;
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          if (rand() < litChance) {
            ctx.globalAlpha = 0.35 + rand() * 0.6;
            ctx.fillRect(bx + bw * 0.14 + cx * bw * 0.72 / Math.max(1, cols - 0.5), base - bh + bh * 0.1 + cy * bh * 0.8 / Math.max(1, rows - 0.5), Math.max(1.2, w * 0.008), Math.max(1.2, hMax * 0.045));
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = colour;
    }
    bx += bw + w * 0.006;
  }
}

function palm(ctx, x, y, s, colour, flip = 1) {
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, s * 0.085);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + flip * s * 0.1, y - s * 0.55, x + flip * s * 0.32, y - s * 0.92);
  ctx.stroke();
  const tx = x + flip * s * 0.32;
  const ty = y - s * 0.92;
  ctx.lineWidth = Math.max(1.2, s * 0.05);
  for (let k = 0; k < 7; k++) {
    const dx = -1 + (k / 6) * 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + dx * s * 0.3, ty - s * 0.26, tx + dx * s * 0.58, ty + s * (0.16 - 0.12 * (1 - Math.abs(dx))));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(tx - s * 0.05, ty + s * 0.05, s * 0.055, 0, Math.PI * 2);
  ctx.arc(tx + s * 0.06, ty + s * 0.07, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
}

function birds(ctx, x, y, w, colour, rand) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1, w / 220);
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const bx = x + rand() * w * 0.7;
    const by = y + rand() * 14;
    const s = w * (0.012 + rand() * 0.012);
    ctx.beginPath();
    ctx.moveTo(bx - s, by);
    ctx.quadraticCurveTo(bx - s * 0.3, by - s * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.3, by - s * 0.7, bx + s, by);
    ctx.stroke();
  }
}

function neonSign(ctx, x, y, w, word, colour, theme) {
  const h = w * 0.34;
  ctx.save();
  ctx.shadowColor = colour;
  ctx.shadowBlur = w * 0.16;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.5, w * 0.02);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, w * 0.06);
  ctx.stroke();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `${h * 0.52}px Anton, 'Arial Black', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, x + w / 2, y + h * 0.54);
  ctx.restore();
  void theme;
}

function boat(ctx, cx, base, s, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.55, base);
  ctx.lineTo(cx + s * 0.55, base);
  ctx.lineTo(cx + s * 0.38, base + s * 0.16);
  ctx.lineTo(cx - s * 0.38, base + s * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - s * 0.02, base - s * 0.62, s * 0.04, s * 0.62);
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.05, base - s * 0.6);
  ctx.lineTo(cx + s * 0.05, base - s * 0.05);
  ctx.lineTo(cx + s * 0.42, base - s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.05, base - s * 0.52);
  ctx.lineTo(cx - s * 0.05, base - s * 0.05);
  ctx.lineTo(cx - s * 0.34, base - s * 0.05);
  ctx.closePath();
  ctx.fill();
}

/** Draws one procedural scene inside the rect. `variant` picks the composition. */
export function drawScene(ctx, x, y, w, h, theme, variant, seed = 1) {
  const rand = seededRandom(seed * 7919 + variant * 131);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  skyGradient(ctx, x, y, w, h, theme.sky);
  const horizon = y + h * (variant === 'harbour' ? 0.55 : 0.68);

  if (theme.batikSky) {
    ctx.globalAlpha = 0.85;
    drawMendungSky(ctx, x, y, w, h * 0.52, '#131c4e', '#27409b', '#5f7fd9', '#e8c877');
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    for (let i = 0; i < 3; i++) {
      const cx = x + rand() * w;
      const cy = y + h * (0.08 + rand() * 0.2);
      const cw = w * (0.2 + rand() * 0.25);
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.ellipse(cx + (j - 1.5) * cw * 0.24, cy + (rand() - 0.5) * h * 0.03, cw * 0.2, h * 0.028, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (variant === 'beach' || variant === 'palms') {
    sunDisc(ctx, x + w * (variant === 'palms' ? 0.5 : 0.34), horizon - h * 0.06, h * 0.13, theme);
    seaBand(ctx, x, horizon, w, y + h - horizon, theme, rand);
    ctx.fillStyle = theme.land;
    ctx.fillRect(x, y + h * 0.94, w, h * 0.06);
    palm(ctx, x + w * 0.06, y + h * 1.0, h * 0.62, theme.land, 1);
    palm(ctx, x + w * 0.97, y + h * 1.0, h * 0.5, theme.land, -1);
    birds(ctx, x + w * 0.15, y + h * 0.12, w, 'rgba(20,10,30,0.55)', rand);
  } else if (variant === 'skyline' || variant === 'strip') {
    sunDisc(ctx, x + w * 0.68, horizon - h * 0.02, h * 0.11, theme);
    skyline(ctx, x, horizon, w, h * 0.52, theme.landFar, rand, null, 0);
    skyline(ctx, x, horizon + h * 0.02, w, h * 0.4, theme.land, rand, theme.window, 0.5);
    ctx.fillStyle = theme.land;
    ctx.fillRect(x, horizon + h * 0.02, w, y + h - horizon);
    skyline(ctx, x, y + h, w, h * 0.3, '#000000', rand, theme.window, 0.4);
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, horizon + h * 0.02, w, Math.max(1.5, h * 0.012));
    ctx.globalAlpha = 1;
    palm(ctx, x + w * 0.03, y + h, h * 0.44, theme.land, 1);
  } else if (variant === 'neon') {
    skyline(ctx, x, horizon, w, h * 0.62, theme.landFar, rand, null, 0);
    skyline(ctx, x, horizon + h * 0.03, w, h * 0.5, theme.land, rand, theme.window, 0.75);
    ctx.fillStyle = '#04040a';
    ctx.fillRect(x, horizon + h * 0.03, w, y + h - horizon);
    const words = ['VICE', 'HOTEL', 'BATIK', 'CLUB'];
    neonSign(ctx, x + w * 0.1, y + h * 0.16, w * 0.3, words[seed % 4], theme.accent, theme);
    neonSign(ctx, x + w * 0.58, y + h * 0.3, w * 0.26, words[(seed + 1) % 4], theme.accent2, theme);
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(x, horizon + h * 0.05, w, h * 0.1);
    ctx.globalAlpha = 1;
  } else if (variant === 'harbour') {
    sunDisc(ctx, x + w * 0.5, horizon - h * 0.03, h * 0.12, theme);
    seaBand(ctx, x, horizon, w, y + h - horizon, theme, rand);
    boat(ctx, x + w * (0.3 + rand() * 0.4), horizon + h * 0.12, w * 0.3, theme.land);
    skyline(ctx, x, horizon, w, h * 0.3, theme.landFar, rand, theme.window, 0.3);
    palm(ctx, x + w * 0.98, y + h * 1.02, h * 0.5, theme.land, -1);
  }
  ctx.restore();
}
