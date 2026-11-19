// Vice Cover Studio — the editor.
//
// Loads your photos (files, drag and drop, or the built-in samples), keeps
// the panel/crop state, wires every control, and renders the live preview
// through cover.js. Nothing leaves the machine: photos are read as object
// URLs and drawn on the canvas here in the page.

import { EXPORT_SIZES, GRADES, LAYOUTS, drawCover, panelRects } from './cover.js';

const SAMPLES = [
  { src: './samples/starlet.jpg', name: 'Starlet' },
  { src: './samples/neon-drive.jpg', name: 'Neon Drive' },
  { src: './samples/boulevard.jpg', name: 'Boulevard' },
  { src: './samples/pier.jpg', name: 'Pier' },
];

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const tray = document.getElementById('tray');

const state = {
  layout: 'classic',
  grade: 'vice',
  intensity: 1,
  title: 'Vice Heat',
  caption: 'One last ride in Neon Bay',
  size: EXPORT_SIZES[0],
  photos: [], // { img, name }
  panels: [], // { photo, dx, dy, zoom } per layout panel
  selected: 0,
};

// A fresh crop for a panel: centred, faces a little above centre.
function freshPanel(photo) {
  return { photo, dx: 0.5, dy: 0.38, zoom: 1 };
}

function panelCount() {
  return panelRects(state.layout, state.size.w, state.size.h).length;
}

// Keep the panel list the right length for the layout, assigning photos
// round-robin so a fresh layout is never empty.
function syncPanels() {
  const n = panelCount();
  while (state.panels.length < n) {
    state.panels.push(freshPanel(state.panels.length % Math.max(1, state.photos.length)));
  }
  state.panels.length = n;
  if (state.selected >= n) state.selected = 0;
}

function render() {
  canvas.width = state.size.w;
  canvas.height = state.size.h;
  drawCover(ctx, canvas.width, canvas.height, state);
  drawSelection();
}

// The selection outline is editor-only chrome; exports never see it.
function drawSelection() {
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  const frac = rects[state.selected];
  if (!frac) return;
  const gutter = Math.max(4, Math.min(canvas.width, canvas.height) * 0.011);
  ctx.save();
  ctx.strokeStyle = '#19e3d2';
  ctx.lineWidth = Math.max(3, canvas.width * 0.004);
  ctx.setLineDash([canvas.width * 0.02, canvas.width * 0.012]);
  ctx.strokeRect(
    frac[0] * canvas.width + gutter / 2, frac[1] * canvas.height + gutter / 2,
    frac[2] * canvas.width - gutter, frac[3] * canvas.height - gutter,
  );
  ctx.restore();
  document.getElementById('panel-label').textContent =
    `Panel ${state.selected + 1} of ${rects.length} — drag to reposition, scroll to zoom`;
  document.getElementById('zoom').value = state.panels[state.selected]?.zoom ?? 1;
}

function say(text) {
  status.textContent = text;
}

// ---- photos ---------------------------------------------------------------

function addPhoto(img, name) {
  state.photos.push({ img, name });
  buildTray();
  syncPanels();
  render();
  say(`${name} added — ${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} in the tray.`);
}

function loadFile(file) {
  if (!file.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => addPhoto(img, file.name.replace(/\.[^.]+$/, ''));
  img.src = URL.createObjectURL(file);
}

function loadSample(sample) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { addPhoto(img, sample.name); resolve(); };
    img.onerror = () => resolve();
    img.src = sample.src;
  });
}

function buildTray() {
  tray.replaceChildren();
  state.photos.forEach((photo, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = `${photo.name} — put it in the selected panel`;
    const im = document.createElement('img');
    im.src = photo.img.src;
    im.alt = photo.name;
    b.append(im);
    b.addEventListener('click', () => {
      state.panels[state.selected] = freshPanel(i);
      render();
      say(`${photo.name} is in panel ${state.selected + 1}.`);
    });
    tray.append(b);
  });
}

// ---- canvas interaction ---------------------------------------------------

function canvasPoint(event) {
  const r = canvas.getBoundingClientRect();
  return [
    (event.clientX - r.left) / r.width * canvas.width,
    (event.clientY - r.top) / r.height * canvas.height,
  ];
}

function panelAt(x, y) {
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  const i = rects.findIndex((f) =>
    x >= f[0] * canvas.width && x < (f[0] + f[2]) * canvas.width &&
    y >= f[1] * canvas.height && y < (f[1] + f[3]) * canvas.height);
  return i === -1 ? state.selected : i;
}

let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  const [x, y] = canvasPoint(event);
  state.selected = panelAt(x, y);
  drag = { x, y, panel: { ...state.panels[state.selected] } };
  canvas.setPointerCapture(event.pointerId);
  render();
});

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const [x, y] = canvasPoint(event);
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  const f = rects[state.selected];
  const panel = state.panels[state.selected];
  const img = state.photos[panel.photo]?.img;
  if (!img) return;
  const pw = f[2] * canvas.width;
  const ph = f[3] * canvas.height;
  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * panel.zoom;
  const overflowX = img.naturalWidth * scale - pw;
  const overflowY = img.naturalHeight * scale - ph;
  if (overflowX > 0) panel.dx = clamp(drag.panel.dx - (x - drag.x) / overflowX, 0, 1);
  if (overflowY > 0) panel.dy = clamp(drag.panel.dy - (y - drag.y) / overflowY, 0, 1);
  render();
});

canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const [x, y] = canvasPoint(event);
  state.selected = panelAt(x, y);
  const panel = state.panels[state.selected];
  panel.zoom = clamp(panel.zoom * (event.deltaY < 0 ? 1.07 : 0.93), 1, 4);
  render();
}, { passive: false });

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// ---- controls ---------------------------------------------------------------

function wireButtons(containerId, attr, apply) {
  const box = document.getElementById(containerId);
  box.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      box.querySelectorAll('button').forEach((o) => o.classList.toggle('on', o === b));
      apply(b.dataset[attr]);
      render();
    });
  });
}

wireButtons('layouts', 'layout', (v) => { state.layout = v; syncPanels(); });
wireButtons('grades', 'grade', (v) => { state.grade = v; });
wireButtons('sizes', 'size', (v) => {
  state.size = EXPORT_SIZES.find((s) => s.id === v) ?? EXPORT_SIZES[0];
  syncPanels();
});

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; render(); });
document.getElementById('caption').addEventListener('input', (e) => { state.caption = e.target.value; render(); });
document.getElementById('intensity').addEventListener('input', (e) => { state.intensity = Number(e.target.value); render(); });
document.getElementById('zoom').addEventListener('input', (e) => {
  state.panels[state.selected].zoom = Number(e.target.value);
  render();
});
document.getElementById('reset-crop').addEventListener('click', () => {
  const photo = state.panels[state.selected].photo;
  state.panels[state.selected] = freshPanel(photo);
  render();
});
document.getElementById('spread').addEventListener('click', () => {
  state.panels = state.panels.map((_, i) => freshPanel(i % state.photos.length));
  render();
  say('Photos spread across the panels in order.');
});

const fileInput = document.getElementById('photo-files');
fileInput.addEventListener('change', () => {
  [...fileInput.files].forEach(loadFile);
  fileInput.value = '';
});

const drop = document.getElementById('drop');
drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('over');
  [...e.dataTransfer.files].forEach(loadFile);
});

document.getElementById('samples').querySelectorAll('button').forEach((b) => {
  b.addEventListener('click', () => loadSample(SAMPLES[Number(b.dataset.sample)]));
});

document.getElementById('export').addEventListener('click', () => {
  const out = document.createElement('canvas');
  out.width = state.size.w;
  out.height = state.size.h;
  drawCover(out.getContext('2d'), out.width, out.height, state);
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${out.width}x${out.height}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    say(`Exported vice-cover-${out.width}x${out.height}.png — post it anywhere.`);
  }, 'image/png');
});

// ---- boot -------------------------------------------------------------------

// A considered opening collage: the hero portrait in the big panel, the
// neon drive beside it, the pier and the boulevard below — each crop tuned
// to where the faces sit in its photo.
const OPENING = [
  { photo: 0, dy: 0.30 }, { photo: 1, dy: 0.50 }, { photo: 3, dy: 0.15 },
  { photo: 1, dy: 0.45 }, { photo: 2, dy: 0.32 },
];

// The lettering font ships with the app; load it before the first render so
// the preview never flashes a fallback face. Samples load one by one, in
// order, so the tray and the opening collage are the same on every machine.
(async () => {
  const anton = new FontFace('Anton', 'url(./fonts/Anton-Regular.ttf)');
  try {
    await anton.load();
    document.fonts.add(anton);
  } catch { /* the fallback face still letters a cover */ }
  for (const sample of SAMPLES) await loadSample(sample);
  state.panels = state.panels.map((_, i) => {
    const open = OPENING[i];
    if (!open) return freshPanel(i % state.photos.length);
    return { ...freshPanel(open.photo), dy: open.dy };
  });
  state.selected = 0;
  render();
  say('Samples loaded — swap in your own photos any time.');
})();
