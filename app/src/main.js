// ViceFrame editor: wires the page to the cover renderer. Photos are read locally with
// object URLs and never leave the machine; every control redraws the live preview, and
// the export buttons render the same cover at exact post sizes and download the PNG.
// A ?shot= query instead composes a fixed scene for screenshots (./shots.js).

import { LAYOUTS, LAYOUT_IDS } from './layouts.js';
import { THEMES, THEME_IDS } from './themes.js';
import { SCENE_KINDS } from './scenes.js';
import { drawCover, makePanels, renderCoverCanvas } from './cover.js';
import { runShot } from './shots.js';

const MAX_PHOTOS = 5;
const canvas = document.getElementById('cover');
const fullCanvas = document.getElementById('fullCover');
const status = document.getElementById('status');

const state = {
  layoutId: 'classic',
  themeId: 'vice',
  title: 'VICE FRAME',
  subtitle: 'One last sunset',
  photos: [],
  activePhoto: -1,
  selected: 0,
  panels: makePanels('classic'),
};
let lastRects = [];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  lastRects = drawCover(canvas, state, { editor: true });
}

function heroIndex() {
  return LAYOUTS[state.layoutId].hero;
}

function setLayout(id) {
  const old = state.panels;
  state.layoutId = id;
  state.panels = makePanels(id);
  old.forEach((panel, i) => { if (state.panels[i]) state.panels[i] = panel; });
  if (state.selected >= state.panels.length) state.selected = heroIndex();
}

function setTheme(id) {
  state.themeId = id;
  state.panels[heroIndex()].batik = id === 'batik';
}

// ---------- photos ----------

async function addPhoto(img, name) {
  if (state.photos.length >= MAX_PHOTOS) {
    status.textContent = `Up to ${MAX_PHOTOS} photos — remove one by setting its panel back to a scene.`;
    return -1;
  }
  state.photos.push({ img, name });
  const index = state.photos.length - 1;
  state.activePhoto = index;
  const hero = state.panels[heroIndex()];
  const target = hero.photo < 0 ? heroIndex() : state.panels.findIndex((p) => p.photo < 0);
  if (target >= 0) {
    state.panels[target].photo = index;
    state.selected = target;
  }
  renderThumbs();
  syncPanelControls();
  redraw();
  return index;
}

async function addPhotoFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    await addPhoto(await loadImage(URL.createObjectURL(file)), file.name);
  }
}

function renderThumbs() {
  const box = document.getElementById('thumbs');
  box.textContent = '';
  state.photos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = i === state.activePhoto ? 'active' : '';
    btn.title = `${photo.name} — click, then click a panel to place it there`;
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.name;
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = `${i + 1}`;
    btn.append(img, num);
    btn.addEventListener('click', () => {
      state.activePhoto = i;
      state.panels[state.selected].photo = i;
      renderThumbs();
      syncPanelControls();
      redraw();
    });
    box.append(btn);
  });
}

// ---------- panel controls ----------

const panelPhoto = document.getElementById('panelPhoto');
const panelScene = document.getElementById('panelScene');
const panelZoom = document.getElementById('panelZoom');
const panelBatik = document.getElementById('panelBatik');

function syncPanelControls() {
  const panel = state.panels[state.selected];
  document.getElementById('panelTitle').textContent = `Panel ${state.selected + 1} of ${state.panels.length}`;
  panelPhoto.textContent = '';
  const sceneOpt = document.createElement('option');
  sceneOpt.value = '-1';
  sceneOpt.textContent = 'Procedural scene';
  panelPhoto.append(sceneOpt);
  state.photos.forEach((photo, i) => {
    const opt = document.createElement('option');
    opt.value = `${i}`;
    opt.textContent = `Photo ${i + 1} — ${photo.name}`;
    panelPhoto.append(opt);
  });
  panelPhoto.value = `${panel.photo}`;
  document.getElementById('sceneField').style.display = panel.photo < 0 ? '' : 'none';
  panelScene.textContent = '';
  for (const kind of SCENE_KINDS) {
    const opt = document.createElement('option');
    opt.value = kind;
    opt.textContent = kind[0].toUpperCase() + kind.slice(1);
    panelScene.append(opt);
  }
  panelScene.value = panel.scene;
  panelZoom.value = `${Math.round(panel.zoom * 100)}`;
  document.getElementById('zoomVal').textContent = `${Math.round(panel.zoom * 100)}%`;
  panelBatik.checked = panel.batik;
  document.querySelectorAll('#modeSeg button').forEach((b) => b.classList.toggle('active', b.dataset.mode === panel.mode));
}

panelPhoto.addEventListener('change', () => {
  state.panels[state.selected].photo = Number(panelPhoto.value);
  syncPanelControls();
  redraw();
});
panelScene.addEventListener('change', () => {
  state.panels[state.selected].scene = panelScene.value;
  redraw();
});
panelZoom.addEventListener('input', () => {
  state.panels[state.selected].zoom = Number(panelZoom.value) / 100;
  document.getElementById('zoomVal').textContent = `${panelZoom.value}%`;
  redraw();
});
panelBatik.addEventListener('change', () => {
  state.panels[state.selected].batik = panelBatik.checked;
  redraw();
});
document.querySelectorAll('#modeSeg button').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.panels[state.selected].mode = btn.dataset.mode;
    syncPanelControls();
    redraw();
  });
});

// ---------- layout & theme buttons ----------

function buildButtons(boxId, ids, labels, current, onPick) {
  const box = document.getElementById(boxId);
  box.textContent = '';
  ids.forEach((id) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = id === current ? 'active' : '';
    btn.textContent = labels[id];
    btn.addEventListener('click', () => onPick(id));
    box.append(btn);
  });
}

function refreshButtons() {
  buildButtons('layoutBtns', LAYOUT_IDS, Object.fromEntries(LAYOUT_IDS.map((id) => [id, LAYOUTS[id].label])), state.layoutId, (id) => {
    setLayout(id);
    refreshButtons();
    syncPanelControls();
    redraw();
  });
  buildButtons('themeBtns', THEME_IDS, Object.fromEntries(THEME_IDS.map((id) => [id, THEMES[id].label])), state.themeId, (id) => {
    setTheme(id);
    refreshButtons();
    syncPanelControls();
    redraw();
  });
}

// ---------- canvas interaction: select, assign, drag, zoom ----------

function canvasPoint(event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * canvas.width,
    y: ((event.clientY - box.top) / box.height) * canvas.height,
  };
}

function panelAt(point) {
  return lastRects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
}

let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const index = panelAt(point);
  if (index < 0) return;
  state.selected = index;
  if (state.activePhoto >= 0 && state.panels[index].photo !== state.activePhoto) {
    state.panels[index].photo = state.activePhoto;
  }
  const panel = state.panels[index];
  if (panel.photo >= 0) {
    drag = { index, startX: point.x, startY: point.y, ox: panel.ox, oy: panel.oy, moved: false };
    canvas.setPointerCapture(event.pointerId);
  }
  syncPanelControls();
  redraw();
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const point = canvasPoint(event);
  const rect = lastRects[drag.index];
  const panel = state.panels[drag.index];
  panel.ox = drag.ox + (point.x - drag.startX) / rect.w;
  panel.oy = drag.oy + (point.y - drag.startY) / rect.h;
  drag.moved = true;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (event) => {
  const panel = state.panels[state.selected];
  if (!panel || panel.photo < 0) return;
  event.preventDefault();
  panel.zoom = Math.max(0.4, Math.min(4, panel.zoom * (event.deltaY < 0 ? 1.06 : 0.94)));
  syncPanelControls();
  redraw();
}, { passive: false });

// ---------- photo intake ----------

document.getElementById('fileInput').addEventListener('change', async (event) => {
  await addPhotoFiles([...event.target.files]);
  event.target.value = '';
});
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', async (event) => {
  event.preventDefault();
  if (event.dataTransfer?.files?.length) await addPhotoFiles([...event.dataTransfer.files]);
});
document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const name = btn.dataset.sample;
    await addPhoto(await loadImage(`samples/${name}.jpg`), `${name}.jpg`);
  });
});

// ---------- words & export ----------

document.getElementById('titleInput').addEventListener('input', (event) => {
  state.title = event.target.value;
  redraw();
});
document.getElementById('subtitleInput').addEventListener('input', (event) => {
  state.subtitle = event.target.value;
  redraw();
});

document.querySelectorAll('[data-size]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const [w, h] = btn.dataset.size.split('x').map(Number);
    renderCoverCanvas(state, w, h).toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `viceframe-${w}x${h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      status.textContent = `Saved viceframe-${w}x${h}.png`;
    }, 'image/png');
  });
});

// ---------- start / shot scenes ----------

async function applyShot(shot, samplePath, opts) {
  if (opts.layout && LAYOUTS[opts.layout]) setLayout(opts.layout);
  if (opts.theme && THEMES[opts.theme]) setTheme(opts.theme);
  const img = await loadImage(samplePath);
  state.photos = [{ img, name: samplePath.split('/').pop() }];
  state.activePhoto = 0;
  const hero = state.panels[heroIndex()];
  hero.photo = 0;
  if (opts.oy !== undefined && Number.isFinite(opts.oy)) hero.oy = opts.oy;
  if (opts.zoom !== undefined && Number.isFinite(opts.zoom)) hero.zoom = opts.zoom;
  state.selected = heroIndex();
  if (opts.title !== undefined) {
    state.title = opts.title;
    document.getElementById('titleInput').value = opts.title;
  }
  if (opts.subtitle !== undefined) {
    state.subtitle = opts.subtitle;
    document.getElementById('subtitleInput').value = opts.subtitle;
  }
  try { await document.fonts.load('100px Anton'); } catch { /* fallback stack paints */ }
  if (shot === 'cover') {
    fullCanvas.width = window.innerWidth;
    fullCanvas.height = window.innerHeight;
    drawCover(fullCanvas, state);
  } else {
    renderThumbs();
    refreshButtons();
    syncPanelControls();
    redraw();
  }
}

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, applyShot);
} else {
  refreshButtons();
  syncPanelControls();
  redraw();
  document.fonts?.load('100px Anton').then(redraw).catch(() => {});
  document.fonts?.ready.then(redraw).catch(() => {});
}
