import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

export default function ImageLightbox({ src, alt = "", caption, onClose }) {
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [smooth, setSmooth] = useState(false);
  const viewportRef = useRef(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const downOnBackdrop = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const smoothTimer = useRef(null);

  const withSmooth = useCallback(() => {
    setSmooth(true);
    clearTimeout(smoothTimer.current);
    smoothTimer.current = setTimeout(() => setSmooth(false), 200);
  }, []);

  const zoomBy = useCallback(
    (factor) => {
      withSmooth();
      setView((v) => {
        const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.s * factor));
        const k = s / v.s;
        return { s, x: v.x * k, y: v.y * k };
      });
    },
    [withSmooth]
  );

  const reset = useCallback(() => {
    withSmooth();
    setView({ s: 1, x: 0, y: 0 });
  }, [withSmooth]);

  const close = useCallback(() => {
    if (typeof onClose === "function") onClose();
  }, [onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "+" || e.key === "=") zoomBy(1.35);
      else if (e.key === "-") zoomBy(1 / 1.35);
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(smoothTimer.current);
    };
  }, [close, zoomBy, reset]);

  const onWheel = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const factor = Math.exp(-e.deltaY * 0.0016);
    setView((v) => {
      const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.s * factor));
      const k = s / v.s;
      return { s, x: cx + (v.x - cx) * k, y: cy + (v.y - cy) * k };
    });
  };

  const onPointerDown = (e) => {
    downOnBackdrop.current = false;
    if (e.button !== 0) return;
    // keep toolbar / close buttons out of drag-capture so their click still lands on them
    if (e.target instanceof Element && e.target.closest("button")) return;
    downOnBackdrop.current = e.target === viewportRef.current;
    dragging.current = true;
    moved.current = false;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    setView((v) => (v.s <= 1 ? v : { ...v, x: v.x + dx, y: v.y + dy }));
  };

  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const onBackdropClick = () => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    if (downOnBackdrop.current) close();
  };

  const onDoubleClick = (e) => {
    if (e.target === viewportRef.current) return close();
    withSmooth();
    setView((v) => {
      if (v.s > 1) return { s: 1, x: 0, y: 0 };
      const rect = viewportRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      return { s: 2.5, x: -cx * (2.5 - 1) * 0.6, y: -cy * (2.5 - 1) * 0.6 };
    });
  };

  if (!src) return null;

  const zoomed = view.s > 1.01;

  return createPortal(
    <div
      ref={viewportRef}
      role="dialog"
      aria-modal="true"
      aria-label={caption || alt || "Image viewer"}
      onClick={onBackdropClick}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onDoubleClick}
      className={`fixed inset-0 z-[120] flex touch-none select-none items-center justify-center overflow-hidden bg-black/90 backdrop-blur-sm ${
        zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
      }`}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] max-w-[92vw] select-none object-contain shadow-2xl"
        style={{
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
          transition: smooth ? "transform 180ms cubic-bezier(.22,.61,.36,1)" : "none",
        }}
      />

      <button
        type="button"
        onClick={close}
        aria-label="Close image viewer"
        className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:border-gold hover:text-gold"
      >
        <X size={20} weight="bold" />
      </button>

      <div
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/55 p-1.5 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.35)}
          aria-label="Zoom out"
          className="grid h-9 w-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-gold"
        >
          <MagnifyingGlassMinus size={17} weight="bold" />
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset zoom"
          className="min-w-[62px] rounded-full px-2 py-2 font-heading text-[12px] font-semibold tracking-[0.06em] text-white/90 tabular-nums transition-colors hover:bg-white/15 hover:text-gold"
        >
          {Math.round(view.s * 100)}%
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1.35)}
          aria-label="Zoom in"
          className="grid h-9 w-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-gold"
        >
          <MagnifyingGlassPlus size={17} weight="bold" />
        </button>
        <span className="mx-1 h-6 w-px bg-white/20" />
        <button
          type="button"
          onClick={reset}
          aria-label="Reset view"
          className="grid h-9 w-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-gold"
        >
          <ArrowCounterClockwise size={17} weight="bold" />
        </button>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-5 hidden max-w-[26vw] truncate rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[12.5px] text-white/85 backdrop-blur-sm md:block">
        Scroll to zoom · drag to pan · Esc to close
      </p>
    </div>,
    document.body
  );
}
