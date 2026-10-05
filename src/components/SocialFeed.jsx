import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { SOCIALS } from "../config";

export default function SocialFeed() {
  const pageUrl = "https://www.facebook.com/masjidassunnahlakemba";
  const wrapRef = useRef(null);
  // The FB page plugin only scales down when the width param matches the
  // container — a fixed 500px inside a ~350px phone card clips the feed.
  const [fbWidth, setFbWidth] = useState(500);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.max(280, Math.min(500, Math.round(el.clientWidth)));
      setFbWidth((prev) => (prev === w ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      className="section section-pattern bg-primary-mist"
      id="social-feed"
    >
      <div className="container">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="eyebrow">From Our Pages</span>
            <h2 className="section-title">Latest Posts</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="section-sub md:pb-2 md:text-right">
              Recent updates from our Facebook page.
            </p>
          </Reveal>
        </div>

        <Reveal className="mx-auto max-w-[512px]">
          <div
            ref={wrapRef}
            className="overflow-hidden rounded-2xl border border-line-soft bg-surface"
          >
            <iframe
              key={fbWidth}
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
                pageUrl
              )}&tabs=timeline&width=${fbWidth}&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&lazy=false`}
              title="Masjid As Sunnah Facebook Feed"
              className="h-[620px] w-full border-0"
              loading="lazy"
              allow="encrypted-media"
            />
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={SOCIALS.facebook.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-deep px-6 py-3.5 font-heading text-[13.5px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary"
            >
              Follow on Facebook
            </a>
            <a
              href={SOCIALS.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 font-heading text-[13.5px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              Follow on Instagram
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
