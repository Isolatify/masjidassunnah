import { Link } from "react-router-dom";
import { House, ArrowLeft } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <main id="page" className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-primary-deep px-6 pt-24 pb-16 text-center">
      <span
        aria-hidden
        className="pattern-overlay pattern-overlay--gold pointer-events-none absolute inset-0"
      />
      <div className="relative">
        <p className="rise text-[11px] font-medium tracking-[0.32em] text-gold uppercase">
          Error 404
        </p>
        <h1
          className="rise mt-4 font-display text-[clamp(96px,22vw,220px)] leading-none font-bold tracking-[-0.04em] text-white"
          style={{ animationDelay: "0.15s" }}
        >
          404
        </h1>
        <p
          className="rise mx-auto mt-5 max-w-md text-[16.5px] leading-relaxed text-white/65"
          style={{ animationDelay: "0.3s" }}
        >
          The page you're looking for doesn't exist or may have been moved.
          Insha'Allah, let's get you back on track.
        </p>
        <div
          className="rise mt-9 flex flex-wrap justify-center gap-3"
          style={{ animationDelay: "0.45s" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 font-heading text-sm font-semibold text-primary-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <House size={16} weight="bold" />
            Back to Home
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 font-heading text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
          >
            <ArrowLeft size={16} weight="bold" />
            Browse Events
          </Link>
        </div>
      </div>
    </main>
  );
}
