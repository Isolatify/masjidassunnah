import Lenis from "lenis";

const ANCHOR = 'a[href^="#"]';

let lenis = null;
let rafId = 0;
let clickHandler = null;
let mediaQuery = null;
let mediaHandler = null;

function startRaf(instance) {
  const raf = (time) => {
    instance.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
}

function create() {
  if (lenis || mediaQuery.matches) return;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });
  document.documentElement.classList.add("has-lenis");
  startRaf(lenis);
}

/**
 * Smooth scrolling for the whole site. Native scrolling is kept when the
 * user prefers reduced motion (and if they toggle it mid-session).
 */
export function initLenis() {
  if (typeof window === "undefined" || mediaQuery) return lenis;

  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  create();

  mediaHandler = () => {
    if (mediaQuery.matches) destroyLenis();
    else create();
  };
  mediaQuery.addEventListener?.("change", mediaHandler);

  // Intercept in-page anchor jumps so Lenis owns the motion.
  clickHandler = (e) => {
    if (!lenis || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.(ANCHOR);
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.length < 2) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    // No manual offset: html's scroll-padding-top (110px, sticky header)
    // is subtracted by lenis itself — an extra offset would double it.
    lenis.scrollTo(el);
  };
  document.addEventListener("click", clickHandler);

  return lenis;
}

export function destroyLenis() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  document.documentElement.classList.remove("has-lenis");
}

export function getLenis() {
  return lenis;
}

/** Smoothly scroll to a pixel offset or an element (falls back to native). */
export function scrollToTarget(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, opts);
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else if (target && typeof target.scrollIntoView === "function") {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Jump to the top instantly (route change) without fighting Lenis. */
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}
