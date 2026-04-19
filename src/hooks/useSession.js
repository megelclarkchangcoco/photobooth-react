/**
 * useSession.js
 *
 * All state that needs to survive navigating from Page 1 → Page 2.
 * Lifted to App level so both pages can read and write the same data.
 */

import { useState, useCallback } from 'react';
import { FORMATS, DEFAULT_ADJ, DEFAULT_STICKER_SIZE, THEMES } from '../constants';

function emptyPhotos(fmt) { return Array(FORMATS[fmt].slots.length).fill(null); }
function emptyAdj(fmt)    { return Array(FORMATS[fmt].slots.length).fill(null).map(() => ({ ...DEFAULT_ADJ })); }

export function useSession() {
  // ── Shared across both pages ──────────────────────────────────────────────
  const [format,      setFormatState] = useState('strip_single');
  const [theme,       setTheme]       = useState(THEMES[0]);
  const [photos,      setPhotos]      = useState(() => emptyPhotos('strip_single'));
  const [adjustments, setAdj]         = useState(() => emptyAdj('strip_single'));
  const [stickers,    setStickers]    = useState([]);    // on the output canvas
  const [textLayers,  setTextLayers]  = useState([]);
  const [imageLayers, setImageLayers] = useState([]);
  const [bgImage,     setBgImage]     = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(-1);
  const [selectedLayerId, setSelectedLayerId] = useState(null); // for text/image layers

  // ── Format ────────────────────────────────────────────────────────────────
  const changeFormat = useCallback((fmt) => {
    setFormatState(fmt);
    setPhotos(emptyPhotos(fmt));
    setAdj(emptyAdj(fmt));
    setStickers([]);
    setSelectedSlot(-1);
  }, []);

  // ── Photos ────────────────────────────────────────────────────────────────
  const addPhoto = useCallback((img) => {
    setPhotos(prev => {
      const next = [...prev];
      const i = next.findIndex(p => p === null);
      if (i === -1) return prev;
      next[i] = img;
      return next;
    });
  }, []);

  const setAllPhotos = useCallback((imgs) => {
    setPhotos(prev => {
      const count = prev.length;
      return Array(count).fill(null).map((_, i) => imgs[i] || null);
    });
    setAdj(prev => prev.map(() => ({ ...DEFAULT_ADJ })));
    setStickers([]);
    setSelectedSlot(-1);
  }, []);

  const resetAll = useCallback((fmt) => {
    const f = fmt || format;
    setPhotos(emptyPhotos(f));
    setAdj(emptyAdj(f));
    setStickers([]);
    setTextLayers([]);
    setImageLayers([]);
    setBgImage(null);
    setSelectedSlot(-1);
    setSelectedLayerId(null);
  }, [format]);

  // ── Adjustments ───────────────────────────────────────────────────────────
  const updateAdj = useCallback((i, field, val) => {
    setAdj(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n; });
  }, []);
  const resetAdj = useCallback((i) => {
    setAdj(prev => { const n = [...prev]; n[i] = { ...DEFAULT_ADJ }; return n; });
  }, []);

  // ── Stickers on output canvas ─────────────────────────────────────────────
  const addSticker = useCallback((s) => {
    setStickers(prev => [...prev, { ...s, id: Date.now() + Math.random(), rotation: 0, selected: false }]);
  }, []);
  const moveSticker = useCallback((id, x, y) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);
  const deleteSticker = useCallback((id) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  }, []);
  const undoSticker = useCallback(() => {
    setStickers(prev => prev.slice(0, -1));
  }, []);
  const clearStickers = useCallback(() => setStickers([]), []);

  // ── Text layers ───────────────────────────────────────────────────────────
  const addText = useCallback((l) => {
    const id = Date.now() + Math.random();
    setTextLayers(prev => [...prev, { ...l, id, selected: false }]);
  }, []);
  const updateText = useCallback((id, changes) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
  }, []);
  const moveText = useCallback((id, x, y) => {
    setTextLayers(prev => prev.map(l => l.id === id ? { ...l, x, y } : l));
  }, []);
  const deleteText = useCallback((id) => {
    setTextLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  // ── Image layers ──────────────────────────────────────────────────────────
  const addImageLayer = useCallback((l) => {
    setImageLayers(prev => [...prev, { ...l, id: Date.now() + Math.random(), selected: false }]);
  }, []);
  const updateImageLayer = useCallback((id, changes) => {
    setImageLayers(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
  }, []);
  const moveImageLayer = useCallback((id, x, y) => {
    setImageLayers(prev => prev.map(l => l.id === id ? { ...l, x, y } : l));
  }, []);
  const deleteImageLayer = useCallback((id) => {
    setImageLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  return {
    format, theme, photos, adjustments, stickers,
    textLayers, imageLayers, bgImage, selectedSlot, selectedLayerId,
    changeFormat, setTheme, addPhoto, setAllPhotos, resetAll,
    updateAdj, resetAdj,
    addSticker, moveSticker, deleteSticker, undoSticker, clearStickers,
    addText, updateText, moveText, deleteText,
    addImageLayer, updateImageLayer, moveImageLayer, deleteImageLayer,
    setBgImage, setSelectedSlot, setSelectedLayerId,
  };
}
