import {
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { SOCIALS } from "../config";
import Reveal from "./Reveal";
import patternData from "../assets/background.png";

const ITEMS = [
  { ...SOCIALS.youtube, icon: YoutubeLogo },
  { ...SOCIALS.instagram, icon: InstagramLogo },
  { ...SOCIALS.facebook, icon: FacebookLogo },
];

export default function Socials() {
  return (
    <section className="section relative overflow-hidden bg-primary" id="socials">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url(${patternData})`,
          backgroundSize: "560px auto",
        }}
      />

      <div className="container relative">
        <Reveal className="section-head">
          <span className="eyebrow">Follow Us</span>
          <h2 className="section-title text-white">Stay Connected</h2>
          <p className="section-sub text-white/60">
            Follow Masjid As Sunnah for announcements, live updates and daily
            reminders.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3">
          {ITEMS.map((s, i) => (
            <Reveal key={s.name} delay={i * 110}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                className="group flex flex-col items-center rounded-2xl border border-white/15 bg-white/10 px-6 py-9 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/60 hover:bg-white/15"
              >
                <s.icon size={40} weight="fill" className="text-white" />
                <span className="mt-5 font-heading text-lg font-semibold text-white">
                  {s.name}
                </span>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] tracking-[0.14em] text-white/55 uppercase transition-colors group-hover:text-gold">
                  Follow
                  <ArrowUpRight size={13} weight="bold" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
