/**
 * useChartTouchLock
 *
 * Prevents the page from scrolling while the user is actively
 * touching/swiping inside a chart area on mobile devices.
 *
 * Usage:
 *   const chartRef = useChartTouchLock();
 *   <div ref={chartRef}> ... <ResponsiveContainer> ... </div>
 *
 * How it works:
 *   - On touchstart inside the element, we call preventDefault on
 *     any subsequent touchmove events, which stops the browser from
 *     interpreting the gesture as a page scroll.
 *   - On touchend / touchcancel we release that lock.
 *   - Listeners are added as { passive: false } so preventDefault works.
 */
import { useRef, useEffect } from 'react';

export function useChartTouchLock<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let touching = false;

    const onTouchStart = () => {
      touching = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touching) {
        // Block page scroll while finger is inside the chart
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      touching = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return ref;
}
