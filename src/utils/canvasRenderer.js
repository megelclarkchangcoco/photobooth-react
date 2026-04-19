import { FORMATS } from '../constants';

export function getSlotRect(format, i) {
  const fmt  = FORMATS[format];
  const s    = fmt.slots[i];
  if (!s) return null;
  return { x: s.x * fmt.cw, y: s.y * fmt.ch, w: s.w * fmt.cw, h: s.h * fmt.ch };
}

export function getSlotAtPoint(format, px, py) {
  const fmt = FORMATS[format];
  for (let i = 0; i < fmt.slots.length; i++) {
    const r = getSlotRect(format, i);
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

function drawBg(ctx, cw, ch, theme, bgImage) {
  if (bgImage) { ctx.drawImage(bgImage, 0, 0, cw, ch); return; }
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, cw, ch);
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, cw - 2, ch - 2);
}

function drawPhoto(ctx, img, rect, adj) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x + w / 2 + adj.offsetX, y + h / 2 + adj.offsetY);
  ctx.rotate(adj.rotation * Math.PI / 180);
  ctx.filter = `brightness(${adj.brightness}%)`;
  const dw = w * adj.scale / 100, dh = h * adj.scale / 100;
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

function drawEmptySlot(ctx, rect, theme, i) {
  ctx.fillStyle = theme.slot;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = theme.text;
  ctx.font = `${Math.max(10, Math.min(rect.w, rect.h) * 0.08)}px DM Mono, monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(i + 1).padStart(2, '0'), rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function drawSelectionBorder(ctx, rect) {
  ctx.save();
  ctx.strokeStyle = '#5b7fff'; ctx.lineWidth = 3;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
  ctx.setLineDash([]); ctx.restore();
}

export function drawStickerItem(ctx, s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate((s.rotation || 0) * Math.PI / 180);
  if (s.type === 'image' && s.imgEl?.complete) {
    ctx.drawImage(s.imgEl, -s.size / 2, -s.size / 2, s.size, s.size);
  } else {
    ctx.font = `${s.size}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.value, 0, 0);
  }
  // Draw selection handle when sticker is active
  if (s.selected) {
    ctx.strokeStyle = '#5b7fff'; ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(-s.size / 2 - 4, -s.size / 2 - 4, s.size + 8, s.size + 8);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawTextLayer(ctx, l) {
  ctx.save();
  ctx.translate(l.x, l.y);
  ctx.rotate((l.rotation || 0) * Math.PI / 180);
  ctx.font = `${l.style || 'normal'} ${l.weight || '400'} ${l.size}px ${l.font || 'DM Sans, sans-serif'}`;
  ctx.fillStyle = l.color || '#ffffff';
  ctx.globalAlpha = l.opacity ?? 1;
  ctx.textAlign = l.align || 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(l.text, 0, 0);
  if (l.selected) {
    ctx.strokeStyle = '#5b7fff'; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    const m = ctx.measureText(l.text);
    ctx.strokeRect(-2, -2, m.width + 4, l.size + 4);
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1; ctx.restore();
}

function drawImageLayer(ctx, l) {
  if (!l.imgEl?.complete) return;
  ctx.save();
  ctx.globalAlpha = l.opacity ?? 1;
  ctx.translate(l.x, l.y);
  ctx.rotate((l.rotation || 0) * Math.PI / 180);
  ctx.drawImage(l.imgEl, 0, 0, l.w, l.h);
  if (l.selected) {
    ctx.strokeStyle = '#5b7fff'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(0, 0, l.w, l.h);
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1; ctx.restore();
}

export function renderCanvas(ctx, { format, theme, bgImage, photos, adjustments, stickers, textLayers, imageLayers, selectedSlot }) {
  const fmt = FORMATS[format];
  ctx.clearRect(0, 0, fmt.cw, fmt.ch);
  drawBg(ctx, fmt.cw, fmt.ch, theme, bgImage);

  // Image layers behind photos
  (imageLayers || []).filter(l => l.zIndex === 'behind').forEach(l => drawImageLayer(ctx, l));

  // Photo slots
  fmt.slots.forEach((_, i) => {
    const rect = getSlotRect(format, i);
    if (photos[i]) drawPhoto(ctx, photos[i], rect, adjustments[i] || { scale: 100, offsetX: 0, offsetY: 0, rotation: 0, brightness: 100 });
    else drawEmptySlot(ctx, rect, theme, i);
    if (i === selectedSlot) drawSelectionBorder(ctx, rect);
  });

  // Stickers
  (stickers || []).forEach(s => drawStickerItem(ctx, s));

  // Image layers on top
  (imageLayers || []).filter(l => l.zIndex !== 'behind').forEach(l => drawImageLayer(ctx, l));

  // Text
  (textLayers || []).forEach(l => drawTextLayer(ctx, l));
}
