/**
 * PageShoot — Page 1
 *
 * Layout:
 *   [Left: Stickers + Filter]  [Centre: Camera — big]  [Right: Format + Theme + Preview]
 *
 * Responsive:
 *   Desktop  → 3 columns side by side
 *   Tablet   → camera top full-width, panels below in 2 columns
 *   Mobile   → all stacked vertically
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCamera, CAM } from '../hooks/useCamera';
import { useCountdown }   from '../hooks/useCountdown';
import { OutputCanvas }   from '../components/OutputCanvas';
import { FORMATS, THEMES, FILTERS, STICKER_CATEGORIES } from '../constants';

const INTER_SHOT = 750;

// Filter out the custom tab if it has no items
const visibleCategories = STICKER_CATEGORIES.filter(c => c.items.length > 0);

export function PageShoot({ session, onDone }) {
  const { videoRef, status: camStatus, capture } = useCamera();
  const { count: cdCount, run: runCd }           = useCountdown();

  const [activeFilter, setActiveFilter] = useState('none');
  const [isBusy,       setIsBusy]       = useState(false);
  const [seriesProg,   setSeriesProg]   = useState([]);
  const [showFlash,    setShowFlash]    = useState(false);
  const [stickerTab,   setStickerTab]   = useState(visibleCategories[0]?.id || 'face');
  const [stickerSize,  setStickerSize]  = useState(52);
  const [camStickers,  setCamStickers]  = useState([]);

  const overlayRef = useRef(null);
  const dragRef    = useRef(null);

  const filterCss  = FILTERS.find(f => f.id === activeFilter)?.css || 'none';
  const slotCount  = FORMATS[session.format].slots.length;
  const photoCount = session.photos.filter(Boolean).length;
  const activeCat  = visibleCategories.find(c => c.id === stickerTab) || visibleCategories[0];

  // Draw stickers onto overlay canvas
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    camStickers.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      if (s.type === 'image' && s.imgEl?.complete) {
        ctx.drawImage(s.imgEl, -s.size / 2, -s.size / 2, s.size, s.size);
      } else {
        ctx.font = `${s.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.value, 0, 0);
      }
      ctx.restore();
    });
  }, [camStickers]);

  // Flash
  function flash() {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 120);
  }

  // Shoot one frame — merges video + overlay stickers
  async function shootOne() {
    flash();
    await new Promise(r => setTimeout(r, 160));
    const v = videoRef.current;
    if (!v || v.videoWidth === 0) throw new Error('Video not ready');
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (filterCss !== 'none') ctx.filter = filterCss;
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(v, -c.width, 0, c.width, c.height); ctx.restore();
    ctx.filter = 'none';
    const overlay = overlayRef.current;
    if (overlay) ctx.drawImage(overlay, 0, 0, c.width, c.height);
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('Frame failed'));
      img.src = c.toDataURL('image/png');
    });
  }

  // Snap
  async function handleSnap() {
    if (isBusy) return;
    if (photoCount >= slotCount) { alert('Strip full! Reset to start over.'); return; }
    setIsBusy(true);
    try {
      await runCd(10);
      const img = await shootOne();
      session.addPhoto(img);
      if (photoCount + 1 >= slotCount) setTimeout(() => onDone(), 450);
    } catch (e) { console.error(e); alert('Capture failed — check camera permission.'); }
    finally { setIsBusy(false); }
  }

  // Series
  async function handleSeries() {
    if (isBusy) return;
    setIsBusy(true);
    setSeriesProg(Array(slotCount).fill(false));
    const imgs = [];
    try {
      for (let i = 0; i < slotCount; i++) {
        await runCd(3);
        const img = await shootOne();
        imgs.push(img);
        setSeriesProg(prev => { const n = [...prev]; n[i] = true; return n; });
        if (i < slotCount - 1) await new Promise(r => setTimeout(r, INTER_SHOT));
      }
      session.setAllPhotos(imgs);
      setTimeout(() => onDone(), 500);
    } catch (e) { console.error(e); alert('Capture failed — check camera permission.'); }
    finally { setIsBusy(false); setSeriesProg([]); }
  }

  // Add sticker to camera overlay
  function addCamSticker(item) {
    const W = 640, H = 480;
    const s = {
      id: Date.now() + Math.random(), type: item.type, value: item.value, imgEl: null,
      x: W * 0.35 + Math.random() * W * 0.3,
      y: H * 0.25 + Math.random() * H * 0.4,
      size: stickerSize,
    };
    if (item.type === 'image') {
      const img = new Image();
      img.onload = () => setCamStickers(prev => [...prev, { ...s, imgEl: img }]);
      img.src = item.value;
    } else {
      setCamStickers(prev => [...prev, s]);
    }
  }

  // Sticker drag on camera overlay
  function toOverlay(clientX, clientY) {
    const canvas = overlayRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  }
  function findCamSticker(cx, cy) {
    for (let i = camStickers.length - 1; i >= 0; i--) {
      const s = camStickers[i];
      if (Math.abs(cx - s.x) < s.size * 0.65 && Math.abs(cy - s.y) < s.size * 0.65) return s;
    }
    return null;
  }
  const onOvMouseDown  = e => { const { x, y } = toOverlay(e.clientX, e.clientY); const s = findCamSticker(x, y); if (s) dragRef.current = { id: s.id, ox: x - s.x, oy: y - s.y }; };
  const onOvMouseMove  = e => { if (!dragRef.current) return; const { x, y } = toOverlay(e.clientX, e.clientY); setCamStickers(prev => prev.map(s => s.id === dragRef.current.id ? { ...s, x: x - dragRef.current.ox, y: y - dragRef.current.oy } : s)); };
  const onOvMouseUp    = () => { dragRef.current = null; };
  const onOvTouchStart = e => { const t = e.touches[0]; const { x, y } = toOverlay(t.clientX, t.clientY); const s = findCamSticker(x, y); if (s) { dragRef.current = { id: s.id, ox: x - s.x, oy: y - s.y }; e.preventDefault(); } };
  const onOvTouchMove  = e => { if (!dragRef.current) return; e.preventDefault(); const t = e.touches[0]; const { x, y } = toOverlay(t.clientX, t.clientY); setCamStickers(prev => prev.map(s => s.id === dragRef.current.id ? { ...s, x: x - dragRef.current.ox, y: y - dragRef.current.oy } : s)); };
  const onOvTouchEnd   = () => { dragRef.current = null; };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' };
  const mono10 = { fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--ink3)', textTransform: 'uppercase', display: 'block', marginBottom: 8 };
  const snapBtn = {
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
    padding: '12px 0', borderRadius: 6, border: 'none',
    background: 'var(--ink)', color: 'var(--bg)',
    cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.45 : 1,
    flex: 1, minHeight: 46, touchAction: 'manipulation',
  };
  const ghostBtn = {
    ...snapBtn, background: 'var(--surface2)', color: 'var(--ink)',
    border: '1px solid var(--border2)', flex: 1,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Responsive CSS ──────────────────────────────────────────────── */}
      <style>{`
        .pb-body { display: flex; gap: 14px; padding: 14px; align-items: flex-start; justify-content: center; flex-wrap: nowrap; overflow-y: auto; flex: 1; }
        .pb-left  { width: 210px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
.pb-cam { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 790px; }        .pb-right { width: 210px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
        .pb-sticker-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; }

        @media (max-width: 900px) {
          .pb-body  { flex-wrap: wrap; }
          .pb-left  { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .pb-left > div { flex: 1; min-width: 180px; }
          .pb-cam   { width: 100%; order: -1; }
          .pb-right { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .pb-right > div { flex: 1; min-width: 160px; }
        }

        @media (max-width: 600px) {
          .pb-body  { padding: 10px; gap: 10px; }
          .pb-left > div, .pb-right > div { min-width: 100%; }
          .pb-sticker-grid { grid-template-columns: repeat(6, 1fr); }
        }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '11px 18px', borderBottom: '1px solid var(--border)', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: 6, color: 'var(--ink)', fontWeight: 500 }}>photo&nbsp;&nbsp;booth</span>
        <div style={{ flex: 1 }} />

        {/* Series progress */}
        {seriesProg.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', marginRight: 4, letterSpacing: 1 }}>shooting</span>
            {seriesProg.map((done, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: done ? 'var(--accent)' : 'var(--border2)', transition: 'background 0.2s' }} />
            ))}
          </div>
        )}

        {/* Camera status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: camStatus === CAM.READY ? 'var(--success)' : camStatus === CAM.ERROR ? 'var(--danger)' : 'var(--ink3)', transition: 'background 0.3s' }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', letterSpacing: 1 }}>
            {camStatus === CAM.READY ? 'live' : camStatus === CAM.ERROR ? 'no camera' : 'loading'}
          </span>
        </div>

        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--ink3)', letterSpacing: 1 }}>{photoCount}/{slotCount}</span>

        <button
          onClick={() => { if (photoCount === 0) { alert('Take at least one photo first!'); return; } onDone(); }}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 5, border: 'none', background: photoCount > 0 ? 'var(--accent)' : 'var(--surface2)', color: photoCount > 0 ? '#fff' : 'var(--ink3)', cursor: photoCount > 0 ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
          Edit Design →
        </button>
      </div>

      {/* ── Main body ────────────────────────────────────────────────────── */}
      <div className="pb-body">

        {/* ── LEFT: Stickers + Filter ──────────────────────────────────── */}
        <div className="pb-left">

          {/* Sticker panel */}
          <div style={panel}>
            <span style={mono10}>Stickers on Camera</span>

            {/* Category tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {visibleCategories.map(cat => (
                <button key={cat.id} onClick={() => setStickerTab(cat.id)}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, padding: '4px 9px', borderRadius: 3, border: '1px solid', cursor: 'pointer', letterSpacing: 0.5,
                    background: stickerTab === cat.id ? 'var(--accent)' : 'transparent',
                    borderColor: stickerTab === cat.id ? 'var(--accent)' : 'var(--border2)',
                    color: stickerTab === cat.id ? '#fff' : 'var(--ink2)' }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sticker grid — fixed 5 columns, no overflow */}
            {activeCat && activeCat.items.length > 0 ? (
              <div className="pb-sticker-grid" style={{ marginBottom: 10 }}>
                {activeCat.items.map(item => (
                  <button key={item.id} onClick={() => addCamSticker(item)} title="Add to camera"
                    style={{ padding: '3px', border: '1px solid transparent', borderRadius: 4, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', transition: 'background 0.1s, transform 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.transform = 'scale(1.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}>
                    {item.type === 'image'
                      ? <img src={item.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: 20, lineHeight: 1 }}>{item.value}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', marginBottom: 10, lineHeight: 1.6 }}>
                Add PNG files to src/stickers/ and uncomment the imports in constants.js
              </p>
            )}

            {/* Size slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', width: 28 }}>size</span>
              <input type="range" min={24} max={100} step={1} value={stickerSize} onChange={e => setStickerSize(+e.target.value)} style={{ flex: 1 }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink2)', width: 22, textAlign: 'right' }}>{stickerSize}</span>
            </div>

            {camStickers.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)' }}>{camStickers.length} placed</span>
                <button onClick={() => setCamStickers([])}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--ink3)', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>
                  clear
                </button>
              </div>
            )}
          </div>

          {/* Filter panel */}
          <div style={panel}>
            <span style={mono10}>Filter</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, padding: '5px 9px', borderRadius: 3, cursor: 'pointer',
                    background: activeFilter === f.id ? 'var(--accent)' : 'transparent',
                    border: `1px solid ${activeFilter === f.id ? 'var(--accent)' : 'var(--border2)'}`,
                    color: activeFilter === f.id ? '#fff' : 'var(--ink2)' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CENTRE: Camera ───────────────────────────────────────────── */}
        <div className="pb-cam">

          {/* Camera box */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 0 2px var(--border), 0 8px 40px rgba(0,0,0,0.5)' }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)', filter: filterCss !== 'none' ? filterCss : undefined }} />

            {/* Sticker overlay */}
            <canvas ref={overlayRef} width={640} height={480}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: camStickers.length > 0 ? 'auto' : 'none', touchAction: 'none' }}
              onMouseDown={onOvMouseDown} onMouseMove={onOvMouseMove} onMouseUp={onOvMouseUp} onMouseLeave={onOvMouseUp}
              onTouchStart={onOvTouchStart} onTouchMove={onOvTouchMove} onTouchEnd={onOvTouchEnd} />

            {/* Flash */}
            <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: showFlash ? 1 : 0, pointerEvents: 'none', transition: 'opacity 0.05s' }} />

            {/* Countdown */}
            {cdCount !== null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 96, color: '#fff', opacity: 0.9, textShadow: '0 2px 30px rgba(0,0,0,0.6)', lineHeight: 1 }}>{cdCount}</span>
              </div>
            )}

            {/* No camera */}
            {camStatus === CAM.ERROR && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', gap: 10 }}>
                <span style={{ fontSize: 40 }}>📷</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--ink2)', textAlign: 'center', padding: '0 24px', lineHeight: 1.8 }}>
                  Camera not available.<br />Check browser permissions.
                </span>
              </div>
            )}
          </div>

          {/* Snap / 4-strip buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={handleSnap} disabled={isBusy} style={snapBtn}>📸 &nbsp;Snap</button>
            <button onClick={handleSeries} disabled={isBusy} style={ghostBtn}>▦ &nbsp;{slotCount}-strip</button>
          </div>

          {/* Reset — subtle text link, not a button */}
          <button onClick={() => { session.resetAll(); setCamStickers([]); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink3)', fontSize: 11, fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: 1, textDecoration: 'underline', opacity: 0.6 }}>
            reset strip
          </button>
        </div>

        {/* ── RIGHT: Format + Theme + Preview ─────────────────────────── */}
        <div className="pb-right">

          {/* Format */}
          <div style={panel}>
            <span style={mono10}>Format</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.values(FORMATS).map(f => (
                <button key={f.id} onClick={() => session.changeFormat(f.id)}
                  style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 5, border: '1px solid', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                    background: session.format === f.id ? 'var(--accent)' : 'var(--surface2)',
                    borderColor: session.format === f.id ? 'var(--accent)' : 'var(--border)',
                    color: session.format === f.id ? '#fff' : 'var(--ink2)', fontWeight: session.format === f.id ? 600 : 400 }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div style={panel}>
            <span style={mono10}>Theme</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {THEMES.map(t => (
                <button key={t.id} onClick={() => session.setTheme(t)} title={t.label}
                  style={{ width: 26, height: 26, borderRadius: '50%', background: t.bg,
                    border: `2.5px solid ${session.theme.id === t.id ? 'var(--accent)' : t.border}`,
                    padding: 0, cursor: 'pointer', transition: 'border-color 0.15s',
                    outline: session.theme.id === t.id ? '2px solid var(--accent)' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <span style={{ ...mono10, alignSelf: 'flex-start' }}>Preview</span>
            <OutputCanvas
              format={session.format} theme={session.theme} bgImage={null}
              photos={session.photos} adjustments={session.adjustments}
              stickers={[]} textLayers={[]} imageLayers={[]}
              selectedSlot={-1}
              onSelectSlot={() => {}} onDeselectSlot={() => {}}
              onMoveSticker={() => {}} onMoveText={() => {}} onMoveImageLayer={() => {}}
              maxHeight={200}
            />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--ink3)', letterSpacing: 1 }}>
              {photoCount} / {slotCount} shots
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
