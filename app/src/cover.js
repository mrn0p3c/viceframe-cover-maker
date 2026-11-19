// The cover renderer: lays out a layout's panels with white GTA gutters, fills each with
// a photo (graded, positioned, zoomed) or a procedural scene, dresses panels in batik on
// request, and stamps the title and caption in heavy cover lettering. Pure canvas: the
// same function paints the editor preview, the full-bleed shot view and PNG exports.

import { LAYOUTS, panelRects } from './layouts.js';
import { THEMES } from './themes.js';
import { drawScene, SCENE_KINDS } from './scenes.js';
import { fillBatik } from './batik.js';

/** Fresh per-panel state for a layout: no photo, centred, filled, scene kind by turns. */
export function makePanels(layoutId) {
  return LAYOUTS[layoutId].panels.map((_, i) => ({
    photo: -1,
    zoom: 1,
    ox: 0,
    oy: 0,
    mode: 'fill',
    batik: false,
    scene: SCENE_KINDS[i % SCENE_KINDS.length],
  }));
}

function drawPhoto(ctx, rect, img, panel, theme) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const base = panel.mode === 'fit' ? Math.min(rect.w / iw, rect.h / ih) : Math.max(rect.w / iw, rect.h / ih);
  const scale = base * panel.zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const maxX = panel.mode === 'fit' ? rect.w * 0.45 : Math.max(0, (dw - rect.w) / 2);
  const maxY = panel.mode === 'fit' ? rect.h * 0.45 : Math.max(0, (dh - rect.h) / 2);
  const dx = Math.max(-maxX, Math.min(maxX, panel.ox * rect.w));
  const dy = Math.max(-maxY, Math.min(maxY, panel.oy * rect.h));
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (panel.mode === 'fit') {
    ctx.fillStyle = '#14101d';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  try { ctx.filter = theme.filter; } catch { /* older engines: overlay still grades */ }
  ctx.drawImage(img, rect.x + (rect.w - dw) / 2 + dx, rect.y + (rect.h - dh) / 2 + dy, dw, dh);
  try { ctx.filter = 'none'; } catch { /* ignore */ }
  theme.overlay(ctx, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawPanelBatik(ctx, rect, theme) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  try { ctx.globalCompositeOperation = 'overlay'; } catch { /* ignore */ }
  fillBatik(ctx, 'mendung', rect.x, rect.y, rect.w, rect.h, Math.max(0.5, rect.w / 520), 0.2);
  ctx.restore();
  const stripH = Math.min(rect.h * 0.12, 54);
  fillBatik(ctx, 'kawung', rect.x, rect.y + rect.h - stripH, rect.w, stripH, Math.max(0.35, rect.w / 900), 0.92);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(rect.x, rect.y + rect.h - stripH - 2, rect.w, 2);
}

function fitFontSize(ctx, text, maxWidth, start, font) {
  let size = start;
  ctx.font = `${size}px ${font}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size *= 0.94;
    ctx.font = `${size}px ${font}`;
  }
  return size;
}

function drawTitle(ctx, w, h, state, theme) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const layout = LAYOUTS[state.layoutId];
  const font = `Anton, 'Archivo Black', 'Arial Black', sans-serif`;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (layout.titleBand) {
    const bandH = h * 0.17;
    ctx.fillStyle = 'rgba(10,8,20,0.88)';
    ctx.fillRect(0, h * 0.045, w, bandH);
    if (state.themeId === 'batik') fillBatik(ctx, 'parang', 0, h * 0.045, w, bandH, 0.5, 0.5);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, h * 0.045, w, 3);
    ctx.fillRect(0, h * 0.045 + bandH - 3, w, 3);
    if (title) {
      const size = fitFontSize(ctx, title, w * 0.9, bandH * 0.62, font);
      ctx.font = `${size}px ${font}`;
      ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.14;
      ctx.strokeStyle = '#120c18';
      const cy = h * 0.045 + bandH * (subtitle ? 0.58 : 0.68);
      ctx.strokeText(title, w / 2, cy);
      const g = ctx.createLinearGradient(0, cy - size, 0, cy);
      g.addColorStop(0, theme.titleFill[0]);
      g.addColorStop(1, theme.titleFill[1]);
      ctx.fillStyle = g;
      ctx.fillText(title, w / 2, cy);
    }
    if (subtitle) drawSubtitle(ctx, w / 2, h * 0.045 + bandH * 0.86, subtitle, theme, h * 0.026);
    ctx.restore();
    return;
  }

  if (state.themeId === 'batik') {
    fillBatik(ctx, 'kawung', 0, 0, w, h * 0.2, Math.max(0.4, w / 1600), 0.35);
    const fade = ctx.createLinearGradient(0, 0, 0, h * 0.2);
    fade.addColorStop(0, 'rgba(16,18,52,0.25)');
    fade.addColorStop(1, 'rgba(16,18,52,0)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, w, h * 0.2);
  }

  let titleBottom = h * 0.05;
  if (title) {
    const size = fitFontSize(ctx, title, w * 0.92, h * 0.105, font);
    ctx.font = `${size}px ${font}`;
    ctx.lineJoin = 'round';
    const baseline = h * 0.045 + size;
    ctx.save();
    ctx.transform(1, 0, -0.045, 1, 0, 0);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowOffsetY = size * 0.06;
    ctx.lineWidth = size * 0.17;
    ctx.strokeStyle = '#140d1a';
    ctx.strokeText(title, w / 2, baseline);
    ctx.shadowColor = 'transparent';
    const g = ctx.createLinearGradient(0, baseline - size, 0, baseline);
    g.addColorStop(0, theme.titleFill[0]);
    g.addColorStop(1, theme.titleFill[1]);
    ctx.fillStyle = g;
    ctx.fillText(title, w / 2, baseline);
    ctx.restore();
    titleBottom = baseline + h * 0.012;
  }
  if (subtitle) drawSubtitle(ctx, w / 2, titleBottom + h * 0.032, subtitle, theme, Math.max(15, h * 0.03));
  ctx.restore();
}

function drawSubtitle(ctx, cx, baseline, text, theme, size) {
  const font = `Anton, 'Archivo Black', 'Arial Black', sans-serif`;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  try { ctx.letterSpacing = `${Math.round(size * 0.22)}px`; } catch { /* plain spacing */ }
  const tw = ctx.measureText(text).width + size * 0.9;
  const skew = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - tw / 2 - skew / 2, baseline - size * 1.06);
  ctx.lineTo(cx + tw / 2 - skew / 2, baseline - size * 1.06);
  ctx.lineTo(cx + tw / 2 + skew / 2, baseline + size * 0.34);
  ctx.lineTo(cx - tw / 2 + skew / 2, baseline + size * 0.34);
  ctx.closePath();
  ctx.fillStyle = theme.band;
  ctx.fill();
  ctx.fillStyle = theme.bandText;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, baseline);
  ctx.restore();
}

/** Paints the whole cover described by `state` onto `canvas`. */
export function drawCover(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const theme = THEMES[state.themeId] ?? THEMES.vice;
  const layout = LAYOUTS[state.layoutId] ?? LAYOUTS.classic;
  const gutter = Math.max(5, Math.round(Math.min(w, h) * 0.013));

  ctx.fillStyle = state.themeId === 'batik' ? '#f3e9d2' : '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(gutter / 2, gutter / 2, w - gutter, h - gutter);

  const rects = panelRects(layout, w, h, gutter);
  rects.forEach((rect, i) => {
    const panel = state.panels[i];
    if (!panel) return;
    const photo = panel.photo >= 0 ? state.photos[panel.photo] : null;
    if (photo) {
      drawPhoto(ctx, rect, photo.img, panel, theme);
    } else {
      drawScene(ctx, rect.x, rect.y, rect.w, rect.h, theme, panel.scene, i + 1);
      theme.overlay(ctx, rect.x, rect.y, rect.w, rect.h);
    }
    if (panel.batik) drawPanelBatik(ctx, rect, theme);
    ctx.strokeStyle = 'rgba(10,6,18,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
  });

  drawTitle(ctx, w, h, state, theme);

  if (opts.editor) {
    const sel = rects[state.selected];
    if (sel) {
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.setLineDash([w * 0.014, w * 0.009]);
      ctx.strokeRect(sel.x - 1, sel.y - 1, sel.w + 2, sel.h + 2);
      ctx.setLineDash([]);
      const label = `${state.selected + 1}`;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(sel.x + 16, sel.y + 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06222b';
      ctx.font = `bold 14px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, sel.x + 16, sel.y + 17);
      ctx.restore();
    }
  }
  return rects;
}

/** Renders the cover at an exact size onto a fresh canvas (for PNG export). */
export function renderCoverCanvas(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas, state);
  return canvas;
}
