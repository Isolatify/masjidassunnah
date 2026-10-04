import { Check, Clock, MapPin, Bell, Compass } from "@phosphor-icons/react";
import { APPS } from "../config";
import Reveal from "./Reveal";
import appStoreImg from "../assets/homepage/appstore.png";
import playStoreImg from "../assets/homepage/playstore.png";
import phoneImg from "../assets/homepage/phone.jpg";

const FEATURES = [
  { icon: Clock, label: "Accurate prayer times" },
  { icon: MapPin, label: "Qibla finder" },
  { icon: Bell, label: "Real-time notifications" },
  { icon: Compass, label: "350,000+ mosques" },
];

function AppStoreButton() {
  return (
    <a
      href={APPS.appStore}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <img src={appStoreImg} alt="" className="h-7 w-7 object-contain" />
      <span className="flex flex-col leading-tight">
        <small className="text-[10px] text-muted">Download on the</small>
        <strong className="font-heading text-[15px] font-semibold text-ink">
          App Store
        </strong>
      </span>
    </a>
  );
}

function PlayStoreButton() {
  return (
    <a
      href={APPS.playStore}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <img src={playStoreImg} alt="" className="h-7 w-7 object-contain" />
      <span className="flex flex-col leading-tight">
        <small className="text-[10px] text-muted">Get it on</small>
        <strong className="font-heading text-[15px] font-semibold text-ink">
          Google Play
        </strong>
      </span>
    </a>
  );
}

export default function AppDownload() {
  return (
    <section className="section" id="app">
      <div className="container">
        <Reveal
          tilt
          tiltMax={5}
          className="overflow-hidden rounded-3xl border border-line-soft bg-gradient-to-br from-bg to-primary-mist/40 lg:grid lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="p-8 md:p-12 lg:p-14">
            <span className="eyebrow">Masjidbox One</span>
            <h2 className="section-title text-[clamp(30px,4vw,44px)]">
              Accurate Prayer Times,
              <br />
              Right In Your Pocket
            </h2>
            <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-muted">
              Get real-time prayer times for Masjid As Sunnah, quick access to
              the Qibla, notifications for prayer changes and much more — with
              the free Masjidbox One app.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 text-[14.5px] text-ink-soft"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-primary shadow-sm">
                    <f.icon size={15} weight="duotone" />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <AppStoreButton />
              <PlayStoreButton />
            </div>

            <p className="mt-5 flex items-center gap-2 text-[12.5px] text-muted">
              <Check size={14} weight="bold" className="text-primary" />
              Free on iOS and Android
            </p>
          </div>

          <div className="relative hidden min-h-[420px] lg:block">
            <img
              src={phoneImg}
              alt="Masjidbox One app preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/60 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
