import { useEffect, useState } from "react";
import { YoutubeLogo, ArrowUpRight, Broadcast } from "@phosphor-icons/react";
import { SOCIALS } from "../config";
import { getLatestLivestream } from "../lib/social";
import Reveal from "./Reveal";

export default function Livestream() {
  const [video, setVideo] = useState(null);

  useEffect(() => {
    let active = true;
    getLatestLivestream().then((v) => {
      if (!active) return;
      setVideo(v);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section bg-bg-slab" id="live">
      <div className="container">
        <Reveal className="overflow-hidden rounded-3xl border border-line-soft bg-surface shadow-sm lg:grid lg:grid-cols-[1fr_1.15fr]">
          {/* Copy */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <span className="inline-flex w-fit items-center gap-2.5 rounded-full bg-primary-mist px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              <i className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </i>
              Live From The Masjid
            </span>

            <h2 className="mt-6 font-display text-[clamp(30px,4vw,44px)] leading-[1.05] font-bold tracking-[-0.02em] text-ink">
              Watch Our Latest{" "}
              <span className="text-primary">Livestream</span>
            </h2>

            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-muted">
              Join us live for Jumu'ah khutbahs, lectures and special programs
              broadcast straight from Masjid As Sunnah. When there is a live
              broadcast, it appears here — otherwise watch our most recent
              stream.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SOCIALS.facebook.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-6 py-3.5 font-heading text-[13.5px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary"
              >
                <Broadcast size={17} weight="duotone" /> Facebook Live
              </a>
              <a
                href={SOCIALS.youtube.streamsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3.5 font-heading text-[13.5px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                <YoutubeLogo size={17} weight="fill" className="text-[#FF0000]" />{" "}
                YouTube Streams
              </a>
            </div>
          </div>

          {/* Stage */}
          <div className="relative bg-primary-deep p-6 md:p-8">
            <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
              {video ? (
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=0&rel=0`}
                    title={video.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center">
                  <span className="text-[14px] text-white/50">
                    Loading latest stream…
                  </span>
                </div>
              )}
            </div>
            <a
              href={video ? `https://www.youtube.com/watch?v=${video.id}` : SOCIALS.youtube.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-start justify-between gap-3 text-[13.5px] text-white/65 transition-colors hover:text-gold"
            >
              <span className="line-clamp-1">
                {video ? video.title : "Most recent broadcast"}
              </span>
              <ArrowUpRight size={15} weight="bold" className="mt-0.5 shrink-0" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
