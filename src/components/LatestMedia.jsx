import { useEffect, useRef, useState } from "react";
import {
  Play,
  ArrowUpRight,
  YoutubeLogo,
  FacebookLogo,
  InstagramLogo,
  Broadcast,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { SOCIALS } from "../config";
import { getLatestVideos } from "../lib/social";
import Reveal from "./Reveal";

const SOCIAL_CARDS = [
  { label: "Facebook Videos", icon: FacebookLogo, url: SOCIALS.facebook.videosUrl },
  { label: "Facebook Reels", icon: FacebookLogo, url: SOCIALS.facebook.reelsUrl },
  { label: "Instagram", icon: InstagramLogo, url: SOCIALS.instagram.url },
];

export default function LatestMedia() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    let active = true;
    getLatestVideos(6).then((v) => {
      if (!active) return;
      setVideos(v);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Mobile swipe: arrows + dots reflect track position.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
      const card = el.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 24 : 0;
      setActiveIdx(step > 0 ? Math.round(el.scrollLeft / step) : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [loading, videos.length]);

  function scrollByCard(dir) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card
      ? card.getBoundingClientRect().width + 24
      : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  function goTo(i) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i];
    if (!card) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: card.offsetLeft - pad, behavior: "smooth" });
  }

  return (
    <section className="section section-pattern" id="gallery">
      <div className="container">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="eyebrow">Media</span>
            <h2 className="section-title">Latest From The Masjid</h2>
          </Reveal>
          <Reveal delay={100}>
            <a
              href={SOCIALS.youtube.url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 py-2 font-heading text-[14px] font-medium text-primary transition-colors hover:text-primary-deep"
            >
              See all on YouTube
              <ArrowUpRight
                size={15}
                weight="bold"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </Reveal>
        </div>

        {/* Videos — swipeable carousel on mobile, grid from sm up */}
        <div className="relative">
          <div
            ref={trackRef}
            className="no-scrollbar mx-[calc(var(--gutter)*-1)] flex snap-x snap-mandatory scroll-pl-[var(--gutter)] gap-6 overflow-x-auto px-[var(--gutter)] pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-x-visible sm:scroll-pl-0 sm:px-0 lg:grid-cols-3"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[78vw] shrink-0 animate-pulse sm:w-auto"
                  >
                    <div className="aspect-video rounded-xl bg-bg-slab" />
                    <div className="mt-4 h-4 w-3/4 rounded bg-bg-slab" />
                    <div className="mt-2 h-3 w-1/4 rounded bg-bg-slab" />
                  </div>
                ))
              : videos.map((item, i) => (
                  <Reveal
                    key={item.id + i}
                    delay={i * 80}
                    className="w-[78vw] shrink-0 snap-start sm:w-auto"
                  >
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group block"
                      aria-label={item.title}
                    >
                      <div className="relative aspect-video overflow-hidden rounded-xl keep-radius bg-primary-deep">
                        <img
                          src={item.thumb}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-primary-deep shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-gold">
                            <Play size={22} weight="fill" />
                          </span>
                        </span>
                      </div>
                      <p className="mt-4 line-clamp-2 font-heading text-[15.5px] leading-snug font-medium text-ink transition-colors group-hover:text-primary">
                        {item.title}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] text-muted">
                        <YoutubeLogo size={13} weight="fill" className="text-[#FF0000]" />
                        YouTube
                      </span>
                    </a>
                  </Reveal>
                ))}
          </div>

          {/* Chevrons pinned to the track sides (mobile only — grid from sm up) */}
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous videos"
            className="absolute top-1/2 left-1 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line/60 bg-surface/95 text-ink shadow-md backdrop-blur transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:hidden"
          >
            <CaretLeft size={15} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next videos"
            className="absolute top-1/2 right-1 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line/60 bg-surface/95 text-ink shadow-md backdrop-blur transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:hidden"
          >
            <CaretRight size={15} weight="bold" />
          </button>
        </div>

        {/* Dot indicators (mobile only) */}
        {!loading && videos.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
            {videos.map((item, i) => (
              <button
                key={item.id + i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show video ${i + 1} of ${videos.length}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIdx === i
                    ? "w-7 bg-primary"
                    : "w-2 bg-primary/30 hover:bg-primary/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Social link cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {SOCIAL_CARDS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-line-soft bg-surface px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-mist hover:shadow-md"
              >
                <span className="flex items-center gap-3.5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-bg text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <s.icon size={20} weight="fill" />
                  </span>
                  <span className="font-heading text-[15px] font-medium text-ink">
                    {s.label}
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  weight="bold"
                  className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </a>
            </Reveal>
          ))}
        </div>

        {/* Watch live band */}
        <Reveal delay={120}>
          <div className="relative mt-10 overflow-hidden rounded-2xl bg-primary-deep text-white">
          <div className="relative flex flex-col items-center justify-between gap-5 px-7 py-6 text-center sm:flex-row sm:text-left">
              <span className="flex items-center gap-3.5 text-[15px]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                  <Broadcast size={20} weight="duotone" />
                </span>
                <span>
                  Follow us for <strong className="text-gold">live</strong>{" "}
                  broadcasts and updates
                </span>
              </span>
              <a
                href={SOCIALS.facebook.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-heading text-[13.5px] font-semibold text-primary-deep transition-all duration-300 hover:bg-gold"
              >
                <FacebookLogo size={16} weight="fill" /> Watch Live
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
