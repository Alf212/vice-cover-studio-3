// Vice Cover Studio — the cover renderer.
//
// Pure canvas painting: given the editor state and a target size, drawCover
// paints the whole multi-panel cover. The live preview and the PNG exports
// call the same code, so the cover you see is the cover you share.
//
// The look, in layers: a warm paper backdrop shows through the gutters
// between panels; every panel cover-fits its photo, then takes the grade —
// a saturation push, a sunset wash laid down with the overlay composite, a
// sun glow, and shade at the foot; the title is lettered over the top of the
// collage in Anton with a sunset gradient fill and a deep outline; the
// caption rides a soft shade band at the bottom.

export const EXPORT_SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

// Panel layouts as [x, y, w, h] fractions of the cover, one set per aspect
// bucket. Each set tiles the whole canvas with no gaps and no overlaps; the
// gutter comes from insetting every panel when it is drawn.
export const LAYOUTS = {
  classic: {
    label: 'Classic Five',
    portrait: [
      [0, 0, 0.56, 0.46], [0.56, 0, 0.44, 0.28], [0.56, 0.28, 0.44, 0.30],
      [0, 0.46, 0.56, 0.54], [0.56, 0.58, 0.44, 0.42],
    ],
    square: [
      [0, 0, 0.52, 0.50], [0.52, 0, 0.48, 0.32], [0.52, 0.32, 0.48, 0.34],
      [0, 0.50, 0.52, 0.50], [0.52, 0.66, 0.48, 0.34],
    ],
    wide: [
      [0, 0, 0.34, 1], [0.34, 0, 0.36, 0.55], [0.70, 0, 0.30, 0.55],
      [0.34, 0.55, 0.36, 0.45], [0.70, 0.55, 0.30, 0.45],
    ],
  },
  trio: {
    label: 'Hero Trio',
    portrait: [[0, 0, 1, 0.58], [0, 0.58, 0.5, 0.42], [0.5, 0.58, 0.5, 0.42]],
    square: [[0, 0, 1, 0.56], [0, 0.56, 0.5, 0.44], [0.5, 0.56, 0.5, 0.44]],
    wide: [[0, 0, 0.62, 1], [0.62, 0, 0.38, 0.5], [0.62, 0.5, 0.38, 0.5]],
  },
  grid: {
    label: 'Grid Four',
    portrait: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
    square: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
    wide: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  },
  strips: {
    label: 'Story Strips',
    portrait: [[0, 0, 0.34, 1], [0.34, 0, 0.33, 1], [0.67, 0, 0.33, 1]],
    square: [[0, 0, 0.34, 1], [0.34, 0, 0.33, 1], [0.67, 0, 0.33, 1]],
    wide: [[0, 0, 1, 0.36], [0, 0.36, 1, 0.32], [0, 0.68, 1, 0.32]],
  },
};

// Colour grades. `wash` is the top-to-bottom sunset laid over every photo
// with the overlay composite, `glow` the sun bloom, `shade` the foot shade,
// `ink` the lettering outline and `paper` the gutter colour.
export const GRADES = {
  vice: {
    label: 'Vice Sunset',
    wash: ['rgba(64,16,128,0.55)', 'rgba(255,45,149,0.28)', 'rgba(255,140,66,0.30)', 'rgba(10,10,40,0.45)'],
    glow: 'rgba(255,166,88,0.55)', shade: 'rgba(16,4,32,0.62)',
    ink: '#2a0a33', paper: '#f7ead9',
    titleStops: ['#fff6ad', '#ffb347', '#ff5da2'],
    filter: (i) => `saturate(${1 + 0.38 * i}) contrast(${1 + 0.10 * i}) brightness(${1 + 0.03 * i})`,
  },
  neon: {
    label: 'Neon Nights',
    wash: ['rgba(6,0,64,0.60)', 'rgba(150,0,255,0.30)', 'rgba(0,229,255,0.26)', 'rgba(2,0,24,0.55)'],
    glow: 'rgba(255,45,200,0.50)', shade: 'rgba(2,0,20,0.66)',
    ink: '#0b0221', paper: '#e8f6ff',
    titleStops: ['#a5f3ff', '#38e1ff', '#ff4fd8'],
    filter: (i) => `saturate(${1 + 0.30 * i}) contrast(${1 + 0.16 * i}) brightness(${1 - 0.03 * i})`,
  },
  gold: {
    label: 'Golden Hour',
    wash: ['rgba(84,32,4,0.42)', 'rgba(255,120,40,0.26)', 'rgba(255,205,90,0.28)', 'rgba(40,14,2,0.42)'],
    glow: 'rgba(255,196,86,0.60)', shade: 'rgba(30,10,0,0.55)',
    ink: '#33150a', paper: '#fdf3d8',
    titleStops: ['#fffbe0', '#ffd76a', '#ff8a3d'],
    filter: (i) => `saturate(${1 + 0.22 * i}) contrast(${1 + 0.06 * i}) brightness(${1 + 0.05 * i}) sepia(${0.22 * i})`,
  },
  clean: {
    label: 'Clean Print',
    wash: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)'],
    glow: 'rgba(255,255,255,0)', shade: 'rgba(0,0,0,0.30)',
    ink: '#14100e', paper: '#ffffff',
    titleStops: ['#ffffff', '#ffe9a8', '#ffb37a'],
    filter: (i) => `saturate(${1 + 0.10 * i}) contrast(${1 + 0.04 * i})`,
  },
};

export function aspectBucket(w, h) {
  if (w > h * 1.15) return 'wide';
  if (h > w * 1.15) return 'portrait';
  return 'square';
}

export function panelRects(layoutId, w, h) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS.classic;
  return layout[aspectBucket(w, h)];
}

// Cover-fit one photo into a panel rect. dx/dy slide the crop window across
// the overflow (0..1, 0.5 centred); zoom multiplies the cover scale.
export function drawPhoto(ctx, img, rect, crop, filter) {
  const [px, py, pw, ph] = rect;
  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * (crop.zoom ?? 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const ox = (dw - pw) * (crop.dx ?? 0.5);
  const oy = (dh - ph) * (crop.dy ?? 0.5);
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.filter = filter;
  ctx.drawImage(img, px - ox, py - oy, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

// An unfilled panel still belongs to the sunset: a graded sky with a low sun.
export function drawEmptyPanel(ctx, rect, grade) {
  const [px, py, pw, ph] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  const sky = ctx.createLinearGradient(0, py, 0, py + ph);
  sky.addColorStop(0, '#3b0f63');
  sky.addColorStop(0.55, '#c22bb0');
  sky.addColorStop(0.8, '#ff8a3d');
  sky.addColorStop(1, '#2a0a33');
  ctx.fillStyle = sky;
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = 'rgba(255,214,140,0.9)';
  ctx.beginPath();
  ctx.arc(px + pw * 0.5, py + ph * 0.78, Math.min(pw, ph) * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = grade.shade;
  ctx.fillRect(px, py + ph * 0.8, pw, ph * 0.2);
  ctx.restore();
}

// The grade over one panel: overlay wash, sun glow, foot shade.
export function gradePanel(ctx, rect, grade) {
  const [px, py, pw, ph] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  const wash = ctx.createLinearGradient(0, py, 0, py + ph);
  grade.wash.forEach((stop, i) => wash.addColorStop(i / (grade.wash.length - 1), stop));
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(px, py, pw, ph);
  ctx.globalCompositeOperation = 'screen';
  const sun = ctx.createRadialGradient(px + pw * 0.78, py + ph * 0.1, 0, px + pw * 0.78, py + ph * 0.1, pw * 0.85);
  sun.addColorStop(0, grade.glow);
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(px, py, pw, ph);
  ctx.globalCompositeOperation = 'source-over';
  const foot = ctx.createLinearGradient(0, py + ph * 0.62, 0, py + ph);
  foot.addColorStop(0, 'rgba(0,0,0,0)');
  foot.addColorStop(1, grade.shade);
  ctx.fillStyle = foot;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();
}

// Fit a font size so `text` in `font` spans at most maxWidth.
function fitFontSize(ctx, text, maxWidth, startSize, font) {
  let size = startSize;
  while (size > 12) {
    ctx.font = `${size}px ${font}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size *= 0.94;
  }
  return size;
}

// Poster lettering: sunset-gradient Anton caps, deep outline, soft drop
// shadow, a slight forward lean. Lines are centred; the block hangs from y.
export function drawTitle(ctx, w, h, title, grade) {
  const lines = title.toUpperCase().split('\n').map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return;
  const startSize = Math.min(w, h) * 0.19;
  const sizes = lines.map((line) => fitFontSize(ctx, line, w * 0.92, startSize, 'Anton'));
  const size = Math.min(...sizes);
  const lineHeight = size * 0.98;
  ctx.save();
  ctx.translate(w / 2, h * 0.045);
  ctx.transform(1, 0, -0.055, 1, 0, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  lines.forEach((line, i) => {
    const y = i * lineHeight;
    const fill = ctx.createLinearGradient(0, y, 0, y + size);
    grade.titleStops.forEach((stop, j) => fill.addColorStop(j / (grade.titleStops.length - 1), stop));
    ctx.font = `${size}px Anton`;
    ctx.shadowColor = 'rgba(20,2,28,0.55)';
    ctx.shadowBlur = size * 0.10;
    ctx.shadowOffsetY = size * 0.045;
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = grade.ink;
    ctx.strokeText(line, 0, y);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = fill;
    ctx.fillText(line, 0, y);
  });
  ctx.restore();
}

// The caption: one quiet line of lettering on the foot shade, letterspaced
// capitals in the same Anton face, a small star set either side of it the
// way a poster credit line is punctuated.
export function drawCaption(ctx, w, h, caption, grade) {
  if (!caption.trim()) return;
  const text = caption.toUpperCase();
  const size = fitFontSize(ctx, text, w * 0.86, Math.min(w, h) * 0.052, 'Anton');
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${size}px Anton`;
  try { ctx.letterSpacing = `${Math.round(size * 0.12)}px`; } catch { /* older canvas */ }
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.18;
  ctx.strokeStyle = grade.ink;
  const y = h * 0.955;
  ctx.strokeText(text, w / 2, y);
  ctx.fillStyle = '#fff8ee';
  ctx.fillText(text, w / 2, y);
  const half = ctx.measureText(text).width / 2;
  ctx.font = `${size * 0.8}px Anton, sans-serif`;
  ctx.fillStyle = grade.titleStops[1];
  ctx.fillText('★', w / 2 - half - size * 0.85, y);
  ctx.fillText('★', w / 2 + half + size * 0.85, y);
  ctx.restore();
}

// A soft vignette to seat the collage, drawn once over everything but the
// lettering.
export function drawVignette(ctx, w, h) {
  const r = Math.hypot(w, h) / 2;
  const v = ctx.createRadialGradient(w / 2, h / 2, r * 0.55, w / 2, h / 2, r);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,0,18,0.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

// Paint the whole cover. state: { layout, grade, intensity, title, caption,
// photos: [img...], panels: [{ photo, dx, dy, zoom }...] }.
export function drawCover(ctx, w, h, state) {
  const grade = GRADES[state.grade] ?? GRADES.vice;
  const rects = panelRects(state.layout, w, h);
  const gutter = Math.max(4, Math.min(w, h) * 0.011);
  ctx.fillStyle = grade.paper;
  ctx.fillRect(0, 0, w, h);
  const filter = grade.filter(state.intensity ?? 1);
  rects.forEach((frac, i) => {
    const rect = [
      frac[0] * w + gutter / 2, frac[1] * h + gutter / 2,
      frac[2] * w - gutter, frac[3] * h - gutter,
    ];
    const panel = state.panels[i];
    const photo = panel && state.photos[panel.photo];
    const img = photo && (photo.img ?? photo);
    if (img) drawPhoto(ctx, img, rect, panel, filter);
    else drawEmptyPanel(ctx, rect, grade);
    gradePanel(ctx, rect, grade);
  });
  drawVignette(ctx, w, h);
  drawTitle(ctx, w, h, state.title, grade);
  drawCaption(ctx, w, h, state.caption, grade);
}
