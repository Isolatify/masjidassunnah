import { ArrowDown } from "@phosphor-icons/react";
import defaultBg from "../assets/photos/hall-arches.jpg";

export default function PageHero({ eyebrow, title, sub, bg }) {
  return (
    <section
      className="relative isolate flex min-h-[58svh] items-end overflow-hidden bg-primary-deep"
      id="top"
    >
      <img
        src={bg || defaultBg}
        alt=""
        className="kenburns absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/85 via-primary-deep/55 to-primary-deep/95" />
      <span
        aria-hidden
        className="pattern-overlay pattern-overlay--gold pointer-events-none absolute inset-0"
      />

      <div className="container relative z-10 pt-36 pb-16 md:pb-20">
        {eyebrow && (
          <p
            className="rise text-[11px] font-medium tracking-[0.32em] text-gold uppercase md:text-xs"
            style={{ animationDelay: "0.1s" }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="rise mt-5 max-w-4xl text-[clamp(38px,6.5vw,72px)] leading-[1.02] font-bold tracking-[-0.03em] text-white"
          style={{ animationDelay: "0.25s" }}
        >
          {title}
        </h1>
        {sub && (
          <p
            className="rise mt-5 max-w-2xl text-[16px] leading-relaxed text-white/70 md:text-[17.5px]"
            style={{ animationDelay: "0.4s" }}
          >
            {sub}
          </p>
        )}
      </div>

      <a
        href="#page"
        aria-label="Scroll to content"
        className="rise absolute right-6 bottom-8 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/25 text-white/70 transition-all duration-300 hover:border-gold hover:text-gold md:grid"
        style={{ animationDelay: "0.6s" }}
      >
        <ArrowDown size={18} weight="bold" className="animate-bounce" />
      </a>
    </section>
  );
}
