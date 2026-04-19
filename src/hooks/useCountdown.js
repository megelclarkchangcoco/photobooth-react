import { useState, useRef, useCallback } from 'react';

export function useCountdown() {
  const [count, setCount] = useState(null);
  const timerRef = useRef(null);

  const run = useCallback((secs = 3) => {
    return new Promise(res => {
      let n = secs;
      setCount(n);
      timerRef.current = setInterval(() => {
        n--;
        if (n <= 0) { clearInterval(timerRef.current); setCount(null); res(); }
        else setCount(n);
      }, 900);
    });
  }, []);

  return { count, run };
}
