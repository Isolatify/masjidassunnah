import { MapPin, CarSimple, Phone } from "@phosphor-icons/react";
import { SITE, MAPS } from "../config";
import Reveal from "./Reveal";

const MAPS_CARDS = [
  {
    icon: MapPin,
    title: "Masjid As Sunnah",
    src: MAPS.masjid,
    iframeTitle: "Masjid As Sunnah location",
  },
  {
    icon: CarSimple,
    title: "Nearby Carparks",
    src: MAPS.parking,
    iframeTitle: "Carparks near Masjid As Sunnah",
  },
];

export default function Location() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="eyebrow">Visit Us</span>
            <h2 className="section-title">Find The Masjid</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="section-sub md:text-right">
                We are located in Lakemba, Sydney. Plan your visit with our
                maps below.
              </p>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 font-heading text-[14.5px] font-medium text-primary transition-colors hover:text-primary-deep"
              >
                <Phone size={15} weight="bold" /> {SITE.phone}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="mb-8 flex items-center justify-center gap-3 rounded-2xl border border-line-soft bg-surface px-6 py-4 text-center text-[15px] text-ink-soft">
          <MapPin size={18} weight="duotone" className="shrink-0 text-gold-deep" />
          <span>{SITE.address}</span>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {MAPS_CARDS.map((m, i) => (
            <Reveal
              key={m.title}
              delay={i * 120}
              className="overflow-hidden rounded-2xl border border-line-soft bg-surface"
            >
              <div className="flex items-center gap-3 border-b border-line-soft px-6 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-mist text-primary">
                  <m.icon size={17} weight="duotone" />
                </span>
                <h3 className="font-heading text-[16px] font-semibold">
                  {m.title}
                </h3>
              </div>
              <iframe
                title={m.iframeTitle}
                src={m.src}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-[340px] w-full border-0"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
