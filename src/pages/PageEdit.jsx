/**
 * PageEdit — Page 2
 *
 * Changes from previous version:
 *  - No "Template" tab — format/theme stay as-is from Page 1
 *  - Every sticker, text layer, image layer has a visible ✕ delete button
 *  - Click any item in the list to select/highlight it on the canvas
 */

import React, { useState, useRef } from 'react';
import { OutputCanvas }     from '../components/OutputCanvas';
import { FORMATS, STICKER_CATEGORIES, DEFAULT_STICKER_SIZE } from '../constants';

const TABS = [
  { id: 'stickers', label: 'Stickers' },
  { id: 'text',     label: 'Text' },
  { id: 'images',   label: 'Images' },
  { id: 'adjust',   label: 'Adjust' },
];

const FONTS = [
  'DM Sans, sans-serif',
  'DM Mono, monospace',
  'Georgia, serif',
  'Impact, sans-serif',
  'Courier New, monospace',
  'Arial Black, sans-serif',
];

const Label = ({ children }) => (
  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--ink3)', textTransform: 'uppercase', marginBottom: 6 }}>
    {children}
  </p>
);

const SliderRow = ({ label, min, max, step = 1, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', width: 46, letterSpacing: 0.5 }}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ flex: 1 }} />
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink2)', width: 30, textAlign: 'right' }}>{value}</span>
  </div>
);

const DeleteBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Delete"
    style={{ background: 'transparent', border: '1px solid var(--danger)', borderRadius: 3, color: 'var(--danger)', cursor: 'pointer', fontSize: 13, padding: '2px 7px', lineHeight: 1.4, flexShrink: 0 }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,84,84,0.12)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    ✕
  </button>
);

export function PageEdit({ session, onBack }) {
  const [activeTab,   setActiveTab]   = useState('stickers');
  const [stickerSize, setStickerSize] = useState(DEFAULT_STICKER_SIZE);
  const [stickerCat,  setStickerCat]  = useState(STICKER_CATEGORIES[0].id);

  // Text form
  const [newText,     setNewText]     = useState('');
  const [textSize,    setTextSize]    = useState(36);
  const [textColor,   setTextColor]   = useState('#ffffff');
  const [textFont,    setTextFont]    = useState(FONTS[0]);
  const [textWeight,  setTextWeight]  = useState('400');
  const [textOpacity, setTextOpacity] = useState(1);

  const imgRef        = useRef(null);
  const canvasWrapRef = useRef(null);

  const fmt        = FORMATS[session.format];
  const photoCount = session.photos.filter(Boolean).length;

  // ── Download ──────────────────────────────────────────────────────────────
  function handleDownload() {
    session.setSelectedSlot(-1);
    setTimeout(() => {
      const canvas = canvasWrapRef.current?.querySelector('canvas');
      if (!canvas?._export) return;
      const a = document.createElement('a');
      a.download = `photobooth-${session.format}.png`;
      a.href = canvas._export();
      a.click();
    }, 80);
  }

  // ── Add sticker ───────────────────────────────────────────────────────────
  function handleAddSticker(item) {
    session.addSticker({
      type:  item.type,
      value: item.value,
      imgEl: item.type === 'image' ? (() => { const i = new Image(); i.src = item.value; return i; })() : null,
      x: fmt.cw * (0.35 + Math.random() * 0.3),
      y: fmt.ch * (0.3  + Math.random() * 0.3),
      size: stickerSize,
    });
  }

  // ── Add text ──────────────────────────────────────────────────────────────
  function handleAddText() {
    if (!newText.trim()) return;
    session.addText({
      text: newText.trim(), size: textSize, color: textColor,
      font: textFont, weight: textWeight, opacity: textOpacity,
      x: fmt.cw * 0.1, y: fmt.ch * 0.45, rotation: 0, align: 'left',
    });
    setNewText('');
  }

  // ── Import image layer ────────────────────────────────────────────────────
  function handleImageLayerImport(e) {
    const file = e.target.files[0]; if (!file) return;
    const img = new Image();
    img.onload = () => {
      session.addImageLayer({
        imgEl: img, x: 20, y: 20,
        w: Math.min(200, fmt.cw * 0.3),
        h: Math.min(200, fmt.cw * 0.3) * (img.height / img.width),
        rotation: 0, opacity: 1, zIndex: 'top',
      });
    };
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  }

  const inp = (extra = {}) => ({
    width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)',
    borderRadius: 4, color: 'var(--ink)', padding: '7px 10px', fontSize: 12, outline: 'none', ...extra,
  });

  const tabBtn = (id) => ({
    fontFamily: 'DM Mono, monospace', fontSize: 10, padding: '7px 0',
    borderRadius: 3, cursor: 'pointer', letterSpacing: 0.5, border: '1px solid',
    background: activeTab === id ? 'var(--accent)' : 'var(--surface2)',
    borderColor: activeTab === id ? 'var(--accent)' : 'var(--border)',
    color: activeTab === id ? '#fff' : 'var(--ink2)',
  });

  const rowStyle = (selected) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    background: selected ? 'rgba(91,127,255,0.1)' : 'var(--surface2)',
    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 4, padding: '6px 8px',
    transition: 'background 0.15s, border-color 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        .pe-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }
        .pe-canvas-area { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 20px; overflow-y: auto; min-width: 0; }
        .pe-panel { width: 290px; flex-shrink: 0; background: var(--surface); border-left: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }

        @media (max-width: 860px) {
          .pe-body { flex-direction: column; overflow-y: auto; }
          .pe-canvas-area { padding: 14px; }
          .pe-panel { width: 100%; border-left: none; border-top: 1px solid var(--border); max-height: 50vh; }
        }

        @media (max-width: 480px) {
          .pe-canvas-area { padding: 8px; }
          .pe-panel { max-height: 55vh; }
        }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '11px 20px', borderBottom: '1px solid var(--border)', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, padding: '8px 14px', borderRadius: 4, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--ink2)', cursor: 'pointer' }}>
          ← Camera
        </button>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, letterSpacing: 6, color: 'var(--ink)', fontWeight: 500 }}>
          photo&nbsp;&nbsp;booth
        </span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', letterSpacing: 2 }}>/&nbsp;edit</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', letterSpacing: 1 }}>
          {photoCount}/{fmt.slots.length}
        </span>
        <button onClick={handleDownload}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, padding: '9px 22px', borderRadius: 4, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          ↓ Download
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="pe-body">

        {/* ── Canvas (centre) ───────────────────────────────────────────── */}
        <div className="pe-canvas-area">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

            <div ref={canvasWrapRef}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'inline-flex' }}>
              <OutputCanvas
                format={session.format} theme={session.theme} bgImage={session.bgImage}
                photos={session.photos} adjustments={session.adjustments}
                stickers={session.stickers} textLayers={session.textLayers} imageLayers={session.imageLayers}
                selectedSlot={session.selectedSlot}
                onSelectSlot={session.setSelectedSlot}
                onDeselectSlot={() => session.setSelectedSlot(-1)}
                onMoveSticker={session.moveSticker}
                onMoveText={session.moveText}
                onMoveImageLayer={session.moveImageLayer}
                maxHeight={580}
              />
            </div>

            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', letterSpacing: 1, textAlign: 'center' }}>
              drag stickers &amp; text · click a photo slot → Adjust tab
            </p>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────── */}
        <div className="pe-panel">

          {/* Tab bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '10px 10px 0' }}>
            {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabBtn(t.id)}>{t.label}</button>)}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* ── STICKERS ─────────────────────────────────────────────── */}
            {activeTab === 'stickers' && (
              <>
                {/* Category tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {STICKER_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setStickerCat(cat.id)}
                      style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, padding: '4px 9px', borderRadius: 3, border: '1px solid', cursor: 'pointer',
                        background: stickerCat === cat.id ? 'var(--accent)' : 'transparent',
                        borderColor: stickerCat === cat.id ? 'var(--accent)' : 'var(--border2)',
                        color: stickerCat === cat.id ? '#fff' : 'var(--ink2)' }}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {STICKER_CATEGORIES.find(c => c.id === stickerCat)?.items.map(item => (
                    <button key={item.id} onClick={() => handleAddSticker(item)}
                      style={{ padding: '4px 2px', border: '1px solid transparent', borderRadius: 4, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s, transform 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.transform = 'scale(1.18)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}>
                      {item.type === 'image'
                        ? <img src={item.value} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                        : <span style={{ fontSize: 22, lineHeight: 1 }}>{item.value}</span>}
                    </button>
                  ))}
                </div>

                {/* Size slider */}
                <SliderRow label="size" min={20} max={140} value={stickerSize} onChange={setStickerSize} />

                {/* Placed stickers list with delete */}
                {session.stickers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Label>On canvas ({session.stickers.length})</Label>
                      <button onClick={session.clearStickers}
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--ink3)', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>
                        clear all
                      </button>
                    </div>
                    {session.stickers.map((s, i) => (
                      <div key={s.id} style={rowStyle(false)}>
                        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                          {s.type === 'image' ? '🖼️' : s.value}
                        </span>
                        <span style={{ flex: 1, fontSize: 11, color: 'var(--ink3)', fontFamily: 'DM Mono, monospace' }}>
                          sticker {i + 1}
                        </span>
                        <DeleteBtn onClick={() => session.deleteSticker(s.id)} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── TEXT ─────────────────────────────────────────────────── */}
            {activeTab === 'text' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Label>Add text</Label>
                  <textarea value={newText} onChange={e => setNewText(e.target.value)}
                    placeholder="Type something..." rows={2}
                    style={inp({ resize: 'vertical' })} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <Label>Font</Label>
                      <select value={textFont} onChange={e => setTextFont(e.target.value)} style={inp()}>
                        {FONTS.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Weight</Label>
                      <select value={textWeight} onChange={e => setTextWeight(e.target.value)} style={inp()}>
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="600">Semi-bold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                  </div>

                  <SliderRow label="size"    min={10} max={140}           value={textSize}    onChange={setTextSize} />
                  <SliderRow label="opacity" min={0.1} max={1} step={0.05} value={textOpacity} onChange={setTextOpacity} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', width: 46 }}>color</span>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      style={{ width: 34, height: 30, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--ink2)' }}>{textColor}</span>
                  </div>

                  <button onClick={handleAddText}
                    style={{ width: '100%', padding: '9px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    + Add Text
                  </button>
                </div>

                {/* Text layers list with delete */}
                {session.textLayers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Label>Text layers ({session.textLayers.length})</Label>
                      <button onClick={() => session.textLayers.forEach(l => session.deleteText(l.id))}
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--ink3)', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>
                        clear all
                      </button>
                    </div>
                    {session.textLayers.map(layer => (
                      <div key={layer.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...rowStyle(false) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ flex: 1, fontSize: 12, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {layer.text}
                          </span>
                          <input type="color" value={layer.color}
                            onChange={e => session.updateText(layer.id, { color: e.target.value })}
                            style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                          <DeleteBtn onClick={() => session.deleteText(layer.id)} />
                        </div>
                        <SliderRow label="size" min={8} max={140} value={layer.size}
                          onChange={v => session.updateText(layer.id, { size: v })} />
                        <SliderRow label="opacity" min={0.1} max={1} step={0.05} value={layer.opacity}
                          onChange={v => session.updateText(layer.id, { opacity: v })} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── IMAGES ───────────────────────────────────────────────── */}
            {activeTab === 'images' && (
              <>
                <div>
                  <Label>Add image to template</Label>
                  <button onClick={() => imgRef.current?.click()}
                    style={{ width: '100%', padding: '9px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 6 }}>
                    + Import image
                  </button>
                  <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageLayerImport} />
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', letterSpacing: 0.5, lineHeight: 1.6 }}>
                    Drag the image on the canvas to reposition it.
                  </p>
                </div>

                {/* Image layers list with delete */}
                {session.imageLayers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Label>Image layers ({session.imageLayers.length})</Label>
                      <button onClick={() => session.imageLayers.forEach(l => session.deleteImageLayer(l.id))}
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--ink3)', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>
                        clear all
                      </button>
                    </div>
                    {session.imageLayers.map((layer, i) => (
                      <div key={layer.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...rowStyle(false) }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 11, color: 'var(--ink2)', fontFamily: 'DM Mono, monospace' }}>
                            Image {i + 1}
                          </span>
                          <DeleteBtn onClick={() => session.deleteImageLayer(layer.id)} />
                        </div>
                        <SliderRow label="size" min={30} max={Math.max(fmt.cw, fmt.ch)} step={5} value={Math.round(layer.w)}
                          onChange={v => { const h = v * (layer.imgEl.height / layer.imgEl.width); session.updateImageLayer(layer.id, { w: v, h }); }} />
                        <SliderRow label="opacity" min={0.1} max={1} step={0.05} value={layer.opacity}
                          onChange={v => session.updateImageLayer(layer.id, { opacity: v })} />
                        <div style={{ display: 'flex', gap: 4 }}>
                          {['behind', 'top'].map(z => (
                            <button key={z} onClick={() => session.updateImageLayer(layer.id, { zIndex: z })}
                              style={{ flex: 1, fontSize: 11, padding: '4px', borderRadius: 3, cursor: 'pointer', border: '1px solid',
                                background: layer.zIndex === z ? 'var(--accent)' : 'transparent',
                                borderColor: layer.zIndex === z ? 'var(--accent)' : 'var(--border2)',
                                color: layer.zIndex === z ? '#fff' : 'var(--ink2)' }}>
                              {z === 'behind' ? 'Behind photos' : 'On top'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── ADJUST ───────────────────────────────────────────────── */}
            {activeTab === 'adjust' && (
              <>
                {session.selectedSlot < 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--ink3)', letterSpacing: 0.5, lineHeight: 1.7 }}>
                      Click any photo slot on the canvas to select it, then adjust it here.
                    </p>
                    {/* Show clickable slot list as shortcut */}
                    {session.photos.map((photo, i) => photo && (
                      <button key={i} onClick={() => session.setSelectedSlot(i)}
                        style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--ink2)', fontSize: 12, cursor: 'pointer' }}>
                        Slot {i + 1}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Label>Slot {session.selectedSlot + 1}</Label>
                      <button onClick={() => session.setSelectedSlot(-1)}
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--ink2)', borderRadius: 3, padding: '3px 8px', cursor: 'pointer' }}>
                        deselect
                      </button>
                    </div>
                    {[
                      { label: 'scale',  field: 'scale',      min: 40,   max: 220 },
                      { label: 'x',      field: 'offsetX',    min: -300, max: 300 },
                      { label: 'y',      field: 'offsetY',    min: -300, max: 300 },
                      { label: 'rotate', field: 'rotation',   min: -30,  max: 30  },
                      { label: 'bright', field: 'brightness', min: 40,   max: 160 },
                    ].map(({ label, field, min, max }) => (
                      <SliderRow key={field} label={label} min={min} max={max}
                        value={session.adjustments[session.selectedSlot]?.[field] ?? 0}
                        onChange={v => session.updateAdj(session.selectedSlot, field, v)} />
                    ))}
                    <button onClick={() => session.resetAdj(session.selectedSlot)}
                      style={{ marginTop: 4, padding: '8px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 4, color: 'var(--ink2)', fontSize: 12, cursor: 'pointer' }}>
                      Reset adjustments
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
