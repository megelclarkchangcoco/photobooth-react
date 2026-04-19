import React, { useRef, useEffect } from 'react';
import { renderCanvas, getSlotAtPoint, getSlotRect } from '../utils/canvasRenderer';
import { FORMATS } from '../constants';

export function OutputCanvas({
  format, theme, bgImage, photos, adjustments,
  stickers, textLayers, imageLayers,
  selectedSlot, onSelectSlot, onDeselectSlot, onMoveSticker,
  onMoveText, onMoveImageLayer,
  maxHeight = 560,
}) {
  const canvasRef = useRef(null);
  const dragRef   = useRef(null); // { type: 'sticker'|'text'|'image', id, ox, oy }
  const fmt = FORMATS[format];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCanvas(canvas.getContext('2d'), {
      format, theme, bgImage, photos, adjustments,
      stickers, textLayers, imageLayers, selectedSlot,
    });
  }, [format, theme, bgImage, photos, adjustments, stickers, textLayers, imageLayers, selectedSlot]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current._export = () => canvasRef.current.toDataURL('image/png');
    }
  });

  function toCanvas(cx, cy) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (cx - r.left) * (fmt.cw / r.width), y: (cy - r.top) * (fmt.ch / r.height) };
  }

  function findDraggable(cx, cy) {
    // Check stickers first (topmost layer)
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      if (Math.abs(cx - s.x) < s.size * 0.7 && Math.abs(cy - s.y) < s.size * 0.7) {
        return { type: 'sticker', id: s.id, ox: cx - s.x, oy: cy - s.y };
      }
    }
    // Text layers
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const l = textLayers[i];
      if (Math.abs(cx - l.x) < 200 && Math.abs(cy - l.y) < l.size * 2) {
        return { type: 'text', id: l.id, ox: cx - l.x, oy: cy - l.y };
      }
    }
    // Image layers
    for (let i = imageLayers.length - 1; i >= 0; i--) {
      const l = imageLayers[i];
      if (cx >= l.x && cx <= l.x + l.w && cy >= l.y && cy <= l.y + l.h) {
        return { type: 'image', id: l.id, ox: cx - l.x, oy: cy - l.y };
      }
    }
    return null;
  }

  function startDrag(clientX, clientY) {
    const { x, y } = toCanvas(clientX, clientY);
    const hit = findDraggable(x, y);
    if (hit) { dragRef.current = hit; return true; }
    return false;
  }

  function doDrag(clientX, clientY) {
    if (!dragRef.current) return;
    const { x, y } = toCanvas(clientX, clientY);
    const d = dragRef.current;
    if (d.type === 'sticker')  onMoveSticker(d.id, x - d.ox, y - d.oy);
    if (d.type === 'text')     onMoveText(d.id, x - d.ox, y - d.oy);
    if (d.type === 'image')    onMoveImageLayer(d.id, x - d.ox, y - d.oy);
  }

  function endDrag(clientX, clientY) {
    if (!dragRef.current) {
      // Treat as a tap — select photo slot
      const { x, y } = toCanvas(clientX, clientY);
      if (!findDraggable(x, y)) {
        const idx = getSlotAtPoint(format, x, y);
        if (idx >= 0 && photos[idx]) {
          idx === selectedSlot ? onDeselectSlot() : onSelectSlot(idx);
        } else if (idx === -1) {
          onDeselectSlot();
        }
      }
    }
    dragRef.current = null;
  }

  // Mouse
  const onMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const onMouseMove = (e) => { if (dragRef.current) doDrag(e.clientX, e.clientY); };
  const onMouseUp   = (e) => endDrag(e.clientX, e.clientY);

  // Touch
  const onTouchStart = (e) => { const t = e.touches[0]; if (startDrag(t.clientX, t.clientY)) e.preventDefault(); };
  const onTouchMove  = (e) => { if (!dragRef.current) return; e.preventDefault(); const t = e.touches[0]; doDrag(t.clientX, t.clientY); };
  const onTouchEnd   = (e) => { const t = e.changedTouches[0]; endDrag(t.clientX, t.clientY); };

  const ratio = fmt.cw / fmt.ch;
  const dispH = Math.min(maxHeight, fmt.ch);
  const dispW = dispH * ratio;

  return (
    <canvas
      ref={canvasRef}
      width={fmt.cw} height={fmt.ch}
      style={{ width: dispW, height: dispH, display: 'block', cursor: 'pointer', borderRadius: 4, userSelect: 'none', touchAction: 'none' }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={() => { dragRef.current = null; }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    />
  );
}
