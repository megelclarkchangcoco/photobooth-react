// ─── Layout formats ───────────────────────────────────────────────────────────
export const FORMATS = {
  strip_single: {
    id: 'strip_single', label: 'Strip ×1', group: 'strip',
    cw: 400, ch: 1200,
    slots: [
      { x: 0.05, y: 0.020, w: 0.90, h: 0.225 },
      { x: 0.05, y: 0.265, w: 0.90, h: 0.225 },
      { x: 0.05, y: 0.510, w: 0.90, h: 0.225 },
      { x: 0.05, y: 0.755, w: 0.90, h: 0.225 },
    ],
  },
  strip_double: {
    id: 'strip_double', label: 'Strip ×2', group: 'strip',
    cw: 820, ch: 1200,
    slots: [
      { x: 0.025, y: 0.020, w: 0.455, h: 0.225 },
      { x: 0.025, y: 0.265, w: 0.455, h: 0.225 },
      { x: 0.025, y: 0.510, w: 0.455, h: 0.225 },
      { x: 0.025, y: 0.755, w: 0.455, h: 0.225 },
      { x: 0.520, y: 0.020, w: 0.455, h: 0.225 },
      { x: 0.520, y: 0.265, w: 0.455, h: 0.225 },
      { x: 0.520, y: 0.510, w: 0.455, h: 0.225 },
      { x: 0.520, y: 0.755, w: 0.455, h: 0.225 },
    ],
  },
  r4_grid: {
    id: 'r4_grid', label: '4R Grid', group: 'print',
    cw: 600, ch: 900,
    slots: [
      { x: 0.04, y: 0.04, w: 0.44, h: 0.44 },
      { x: 0.52, y: 0.04, w: 0.44, h: 0.44 },
      { x: 0.04, y: 0.52, w: 0.44, h: 0.44 },
      { x: 0.52, y: 0.52, w: 0.44, h: 0.44 },
    ],
  },
  r4_single: {
    id: 'r4_single', label: '4R Single', group: 'print',
    cw: 600, ch: 900,
    slots: [{ x: 0.04, y: 0.05, w: 0.92, h: 0.88 }],
  },
  square: {
    id: 'square', label: 'Square', group: 'social',
    cw: 800, ch: 800,
    slots: [
      { x: 0.03,  y: 0.03,  w: 0.455, h: 0.455 },
      { x: 0.515, y: 0.03,  w: 0.455, h: 0.455 },
      { x: 0.03,  y: 0.515, w: 0.455, h: 0.455 },
      { x: 0.515, y: 0.515, w: 0.455, h: 0.455 },
    ],
  },
  wide: {
    id: 'wide', label: 'Wide', group: 'social',
    cw: 1000, ch: 500,
    slots: [
      { x: 0.020, y: 0.08, w: 0.22, h: 0.84 },
      { x: 0.265, y: 0.08, w: 0.22, h: 0.84 },
      { x: 0.510, y: 0.08, w: 0.22, h: 0.84 },
      { x: 0.755, y: 0.08, w: 0.22, h: 0.84 },
    ],
  },
};

// ─── Themes ───────────────────────────────────────────────────────────────────
export const THEMES = [
  { id: 'clean',     label: 'Clean',     bg: '#ffffff', border: '#e0e0e0', slot: '#f0f0f0', text: '#bbbbbb' },
  { id: 'dark',      label: 'Dark',      bg: '#111111', border: '#222222', slot: '#1a1a1a', text: '#333333' },
  { id: 'noir',      label: 'Noir',      bg: '#0d0d0d', border: '#1c1c1c', slot: '#141414', text: '#252525' },
  { id: 'warm',      label: 'Warm',      bg: '#faf6f0', border: '#e5ddd0', slot: '#f0e8dd', text: '#c8b8a8' },
  { id: 'slate',     label: 'Slate',     bg: '#1a2030', border: '#253045', slot: '#202838', text: '#304060' },
  { id: 'carbon',    label: 'Carbon',    bg: '#1a1a1c', border: '#2a2a2e', slot: '#222224', text: '#ff6b2b' },
  { id: 'blueprint', label: 'Blueprint', bg: '#0a1628', border: '#1a3060', slot: '#0e1e38', text: '#2060cc' },
  { id: 'forest',    label: 'Forest',    bg: '#0f1a10', border: '#1a3020', slot: '#141e14', text: '#2a5030' },
  { id: 'rose',      label: 'Rose',      bg: '#1a0f12', border: '#3a1a22', slot: '#22141a', text: '#cc3060' },
  { id: 'gold',      label: 'Gold',      bg: '#12100a', border: '#3a3010', slot: '#1a1808', text: '#cc9910' },
];

// ─── Filters ──────────────────────────────────────────────────────────────────
export const FILTERS = [
  { id: 'none',   label: 'Raw',    css: 'none' },
  { id: 'bw',     label: 'B&W',    css: 'grayscale(100%)' },
  { id: 'sepia',  label: 'Sepia',  css: 'sepia(70%)' },
  { id: 'vivid',  label: 'Vivid',  css: 'contrast(1.4) saturate(1.4)' },
  { id: 'noir',   label: 'Noir',   css: 'contrast(1.6) brightness(0.85) grayscale(20%)' },
  { id: 'fade',   label: 'Fade',   css: 'brightness(1.1) contrast(0.85) saturate(0.7)' },
  { id: 'teal',   label: 'Teal',   css: 'sepia(30%) hue-rotate(155deg) saturate(1.3)' },
  { id: 'cool',   label: 'Cool',   css: 'hue-rotate(200deg) saturate(1.4) contrast(1.1)' },
  { id: 'warm',   label: 'Warm',   css: 'sepia(25%) saturate(1.3) brightness(1.05)' },
  { id: 'chrome', label: 'Chrome', css: 'contrast(1.3) saturate(1.5) brightness(1.05)' },
];

// ─── Stickers ─────────────────────────────────────────────────────────────────
// To use your own PNG files:
//   1. Copy PNGs to src/stickers/  (e.g. src/stickers/lanaya.png)
//   2. Uncomment the import lines below
//   3. Replace the placeholder items in 'custom' with image entries

// import lanayaPng    from './stickers/lanaya.png';
// import nevermorePng from './stickers/nevermore.png';

export const STICKER_CATEGORIES = [
  {
    id: 'custom', label: 'Custom',
    items: [
      // ── Uncomment these when you add your PNG files ──────────────────────
      // { id: 'c1', type: 'image', value: lanayaPng,    label: 'Lanaya' },
      // { id: 'c2', type: 'image', value: nevermorePng, label: 'Nevermore' },
    ],
  },
  {
    id: 'face', label: 'Face',
    items: [
      { id: 'f1',  type: 'emoji', value: '😀' }, { id: 'f2',  type: 'emoji', value: '😂' },
      { id: 'f3',  type: 'emoji', value: '😎' }, { id: 'f4',  type: 'emoji', value: '🥶' },
      { id: 'f5',  type: 'emoji', value: '😍' }, { id: 'f6',  type: 'emoji', value: '🤩' },
      { id: 'f7',  type: 'emoji', value: '😤' }, { id: 'f8',  type: 'emoji', value: '😴' },
      { id: 'f9',  type: 'emoji', value: '🥸' }, { id: 'f10', type: 'emoji', value: '🤯' },
      { id: 'f11', type: 'emoji', value: '😈' }, { id: 'f12', type: 'emoji', value: '💀' },
      { id: 'f13', type: 'emoji', value: '👻' }, { id: 'f14', type: 'emoji', value: '🤖' },
      { id: 'f15', type: 'emoji', value: '👽' }, { id: 'f16', type: 'emoji', value: '🎭' },
    ],
  },
  {
    id: 'symbol', label: 'Symbol',
    items: [
      { id: 's1',  type: 'emoji', value: '⭐' }, { id: 's2',  type: 'emoji', value: '✨' },
      { id: 's3',  type: 'emoji', value: '💫' }, { id: 's4',  type: 'emoji', value: '❤️' },
      { id: 's5',  type: 'emoji', value: '🖤' }, { id: 's6',  type: 'emoji', value: '💙' },
      { id: 's7',  type: 'emoji', value: '🔥' }, { id: 's8',  type: 'emoji', value: '⚡' },
      { id: 's9',  type: 'emoji', value: '☯️' }, { id: 's10', type: 'emoji', value: '⚔️' },
      { id: 's11', type: 'emoji', value: '🛡️' }, { id: 's12', type: 'emoji', value: '👁️' },
      { id: 's13', type: 'emoji', value: '🔮' }, { id: 's14', type: 'emoji', value: '💎' },
      { id: 's15', type: 'emoji', value: '🏆' }, { id: 's16', type: 'emoji', value: '🎯' },
    ],
  },
  {
    id: 'nature', label: 'Nature',
    items: [
      { id: 'n1',  type: 'emoji', value: '🌿' }, { id: 'n2',  type: 'emoji', value: '🌊' },
      { id: 'n3',  type: 'emoji', value: '🌙' }, { id: 'n4',  type: 'emoji', value: '☀️' },
      { id: 'n5',  type: 'emoji', value: '🌸' }, { id: 'n6',  type: 'emoji', value: '🍂' },
      { id: 'n7',  type: 'emoji', value: '🦋' }, { id: 'n8',  type: 'emoji', value: '🐺' },
      { id: 'n9',  type: 'emoji', value: '🦅' }, { id: 'n10', type: 'emoji', value: '🐉' },
      { id: 'n11', type: 'emoji', value: '🌋' }, { id: 'n12', type: 'emoji', value: '🌌' },
    ],
  },
  {
    id: 'misc', label: 'Misc',
    items: [
      { id: 'm1',  type: 'emoji', value: '🎸' }, { id: 'm2',  type: 'emoji', value: '🎮' },
      { id: 'm3',  type: 'emoji', value: '📸' }, { id: 'm4',  type: 'emoji', value: '🚀' },
      { id: 'm5',  type: 'emoji', value: '✈️' }, { id: 'm6',  type: 'emoji', value: '🏍️' },
      { id: 'm7',  type: 'emoji', value: '🎧' }, { id: 'm8',  type: 'emoji', value: '💻' },
      { id: 'm9',  type: 'emoji', value: '🎲' }, { id: 'm10', type: 'emoji', value: '⌚' },
      { id: 'm11', type: 'emoji', value: '🔑' }, { id: 'm12', type: 'emoji', value: '🗡️' },
    ],
  },
];

export const DEFAULT_STICKER_SIZE = 52;
export const DEFAULT_ADJ = { scale: 100, offsetX: 0, offsetY: 0, rotation: 0, brightness: 100 };
