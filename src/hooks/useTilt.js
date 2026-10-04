import { useEffect } from "react";

/**
 * Pointer-tracked 3D tilt written as CSS custom properties (no React
 * re-renders per mousemove — `.tilt` in index.css owns the transform).
 *
 * Active only on fine pointers when the user hasn't asked for reduced
 * motion; touch / reduced-motion users get a static element.
 */
export default function useTilt(ref, enabled = true, max = 7) {
  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return undefined;

    const set = (x, y, mx, my) => {
      el.style.setProperty("--tilt-x", `${x.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${y.toFixed(2)}deg`);
      el.style.setProperty("--tilt-mx", mx);
      el.style.setProperty("--tilt-my", my);
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      set(
        (0.5 - py) * max * 2,
        (px - 0.5) * max * 2,
        `${(px * 100).toFixed(1)}%`,
        `${(py * 100).toFixed(1)}%`
      );
    };

    const onLeave = () => set(0, 0, "50%", "50%");

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, enabled, max]);
}
