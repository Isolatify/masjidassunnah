import { useEffect, useRef } from "react";
import { ArrowDown, EnvelopeSimple, MapPin, Clock } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import heroPhoto from "../assets/photos/hall-wide.jpg";
import { SITE } from "../config";
import useJumuah from "../lib/useJumuah";

const FACTS = [
  {
    icon: MapPin,
    label: "Find us",
    value: "132–136 Haldon St, Lakemba NSW",
    href: "https://www.google.com/maps/search/Masjid+As-Sunnah+132+Haldon+St+Lakemba",
  },
  {
    icon: Clock,
    label: "Jumu'ah",
    value: "Khutbah every Friday, 12:15 PM",
    href: "/prayer#jumuah",
  },
  {
    icon: EnvelopeSimple,
    label: "Get in touch",
    value: SITE.email,
    href: SITE.emailHref,
  },
];

export default function Hero() {
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const jumuah = useJumuah();

  const facts = FACTS.map((f) =>
    f.label === "Jumu'ah"
      ? { ...f, value: `Khutbah every Friday, ${jumuah.athan}` }
      : f
  );

  useEffect(() => {
    const hero = heroRef.current;
    const bg = bgRef.current;
    if (!hero || !bg) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH = hero.offsetHeight;
        if (scrollY < heroH) {
          const pct = scrollY / heroH;
          bg.style.transform = `translate3d(0, ${pct * 12}%, 0) scale(${1 + pct * 0.18})`;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Pointer depth: the photo drifts subtly toward the cursor (fine pointers only).
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPointer = (e) => {
      if (reduce.matches) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty(
        "--hmx",
        ((e.clientX - r.left) / r.width - 0.5).toFixed(3)
      );
      hero.style.setProperty(
        "--hmy",
        ((e.clientY - r.top) / r.height - 0.5).toFixed(3)
      );
    };
    const onPointerLeave = () => {
      hero.style.setProperty("--hmx", "0");
      hero.style.setProperty("--hmy", "0");
    };
    if (fine.matches) {
      hero.addEventListener("pointermove", onPointer);
      hero.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-primary-deep"
    >
      {/* Photo + parallax */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <div className="hero-depth h-full w-full">
          <img
            src={heroPhoto}
            alt=""
            className="kenburns h-full w-full object-cover object-center"
          />
        </div>
      </div>

      {/* Cinematic tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/80 via-primary-deep/45 to-primary-deep/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/70 via-transparent to-transparent" />

      <div className="container relative z-10 pt-36 pb-16 md:pb-20">
        <p
          className="rise font-body text-[11px] font-medium tracking-[0.32em] text-gold uppercase md:text-xs"
          style={{ animationDelay: "0.15s" }}
        >
          Assalamu Alaikum Wa Rahmatullah
        </p>

        <h1
          className="rise mt-5 max-w-4xl text-[clamp(44px,5vw,64px)] leading-[1.203] font-semibold tracking-[-0.038em] text-white"
          style={{ animationDelay: "0.3s" }}
        >
          Welcome to
          <br />
          Masjid As-Sunnah
        </h1>

        <p
          className="rise mt-6 max-w-xl text-[16px] leading-relaxed text-white/75 md:text-[18px]"
          style={{ animationDelay: "0.45s" }}
        >
          A place of worship, knowledge and community — upon the Qur'an and the
          authentic Sunnah of the Prophet Muhammad ﷺ.
        </p>

        <div
          className="rise mt-9 flex flex-wrap gap-3"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            to="/prayer"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 font-heading text-sm font-semibold tracking-[0.02em] text-primary-deep shadow-[0_16px_40px_-16px_rgba(200,166,93,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            Prayer Times
            <ArrowDown size={15} weight="bold" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 font-heading text-sm font-medium tracking-[0.02em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
          >
            Discover More
          </Link>
        </div>

        {/* Facts strip */}
        <div
          className="rise mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-3"
          style={{ animationDelay: "0.75s" }}
        >
          {facts.map((f) => {
            const inner = (
              <>
                <f.icon size={16} weight="bold" className="mt-0.5 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-medium tracking-[0.22em] text-white/45 uppercase">
                    {f.label}
                  </span>
                  <span className="mt-1 block truncate font-heading text-[14.5px] font-medium text-white">
                    {f.value}
                  </span>
                </span>
              </>
            );
            const cls =
              "flex items-start gap-3 bg-primary-deep/40 px-5 py-4 transition-colors duration-300 hover:bg-primary-deep/60";
            return f.href.startsWith("/") || f.href.startsWith("#") ? (
              <Link key={f.label} to={f.href} className={cls}>
                {inner}
              </Link>
            ) : (
              <a
                key={f.label}
                href={f.href}
                target={f.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className={cls}
              >
                {inner}
              </a>
            );
          })}
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to content"
        className="absolute right-6 bottom-8 z-10 hidden h-12 w-12 place-items-center rounded-full border border-white/25 text-white/70 transition-all duration-300 hover:border-gold hover:text-gold md:grid"
      >
        <ArrowDown size={18} weight="bold" className="animate-bounce" />
      </a>
    </section>
  );
}
