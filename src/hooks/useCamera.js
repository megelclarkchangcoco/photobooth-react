import { useState, useEffect, useRef, useCallback } from 'react';

export const CAM = { LOADING: 'loading', READY: 'ready', ERROR: 'error' };

function waitForVideo(el) {
  return new Promise((res, rej) => {
    if (el.videoWidth > 0) { res(); return; }
    let elapsed = 0;
    const t = setInterval(() => {
      elapsed += 100;
      if (el.videoWidth > 0) { clearInterval(t); res(); }
      else if (elapsed >= 10000) { clearInterval(t); rej(new Error('Camera timeout')); }
    }, 100);
  });
}

export function useCamera() {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState(CAM.LOADING);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width:  { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await waitForVideo(videoRef.current);
        }
        if (!cancelled) setStatus(CAM.READY);
      } catch {
        if (!cancelled) setStatus(CAM.ERROR);
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = useCallback(async (cssFilter = 'none') => {
    const v = videoRef.current;
    if (!v) throw new Error('No video element');
    if (v.videoWidth === 0) await waitForVideo(v);
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (cssFilter !== 'none') ctx.filter = cssFilter;
    ctx.drawImage(v, 0, 0);
    ctx.filter = '';
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload  = () => res(img);
      img.onerror = () => rej(new Error('Frame load failed'));
      img.src = c.toDataURL('image/jpeg', 0.93);
    });
  }, []);

  return { videoRef, status, capture };
}
