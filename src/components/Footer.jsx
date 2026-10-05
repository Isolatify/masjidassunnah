import { useState } from "react";
import {
  ArrowRight,
  EnvelopeSimple,
  MapPin,
  Phone,
  FacebookLogo,
  InstagramLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { SITE, SOCIALS } from "../config";
import { useSettings } from "../lib/siteSettings";
import { supabase } from "../lib/supabase";
import logoWhite from "../assets/logo-white.png";
import pattern from "../assets/background.png";

const SOCIAL_ITEMS = [
  { name: SOCIALS.facebook.name, url: SOCIALS.facebook.url, icon: FacebookLogo },
  { name: SOCIALS.instagram.name, url: SOCIALS.instagram.url, icon: InstagramLogo },
  { name: SOCIALS.youtube.name, url: SOCIALS.youtube.url, icon: YoutubeLogo },
];

/** Admin settings override the static config when they are set. */
function useSiteInfo() {
  const s = useSettings();
  const email = s.site?.email || SITE.email;
  const phone = s.site?.phone || SITE.phone;
  const address = s.site?.address || SITE.addressShort;
  const socials = [
    { name: "Facebook", url: s.socials?.facebook, icon: FacebookLogo },
    { name: "Instagram", url: s.socials?.instagram, icon: InstagramLogo },
    { name: "YouTube", url: s.socials?.youtube, icon: YoutubeLogo },
    { name: "TikTok", url: s.socials?.tiktok, icon: null },
    { name: "Telegram", url: s.socials?.telegram, icon: null },
    { name: "WhatsApp", url: s.socials?.whatsapp, icon: null },
  ].filter((x) => x.url);
  return {
    settings: s,
    email,
    emailHref: `mailto:${email}`,
    phone,
    phoneHref: `tel:${phone.replace(/[^+\d]/g, "")}`,
    address,
    // Fall back to the built-in links when the admin has not set any.
    socialItems: socials.length ? socials : SOCIAL_ITEMS,
  };
}

const PAGE_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Prayer Times", to: "/prayer" },
  { label: "Weekly Timetable", to: "/timetable" },
  { label: "Events", to: "/events" },
  { label: "Contact Us", to: "/contact" },
  { label: "Donate", to: "/donate" },
];

const COLLEGE_LINKS = [
  { label: "Alfirdaus College", to: "/colleges" },
  { label: "Islamic College of Australia", to: "/icoa" },
];

function ColHeading({ children }) {
  return (
    <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
      {children}
    </p>
  );
}

function NewsletterBand({ contactEmail }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState(null); // "busy" | "ok" | "error"

  async function onSubmit(e) {
    e.preventDefault();
    const email = value.trim();
    if (!email) return;
    setStatus("busy");
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });
      if (error) throw error;
      setStatus("ok");
      setValue("");
    } catch {
      setStatus("error");
    }
  }

  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
    "Newsletter signup",
  )}&body=${encodeURIComponent(
    `Please add ${value.trim() || "me"} to the weekly newsletter.`,
  )}`;

  return (
    <div className="relative border-b border-white/10">
      <div className="container grid gap-8 py-14 md:grid-cols-2 md:items-end md:py-16">
        <div>
          <p className="text-[11px] font-medium tracking-[0.28em] text-gold uppercase">
            Stay close to the masjid
          </p>
          <p className="mt-4 max-w-md font-display text-[clamp(24px,3vw,34px)] leading-[1.3] font-semibold text-white">
            A quiet weekly note — classes, events, reflections.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="md:max-w-md md:justify-self-end"
        >
          <div className="flex items-center gap-4 border-b border-white/25 pb-3 transition-colors focus-within:border-gold">
            <input
              type="email"
              required
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setStatus(null);
              }}
              placeholder="your@email.com"
              aria-label="Email address"
              className="w-full min-w-0 bg-transparent text-[15px] text-white outline-none placeholder-white/40"
            />
            <button
              type="submit"
              disabled={status === "busy"}
              className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-gold uppercase transition-colors hover:text-white disabled:opacity-50"
            >
              Subscribe
              <ArrowRight
                size={13}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-white/45">
            {status === "ok" && (
              <span className="text-gold/90">
                You&apos;re on the list — see you in your inbox.
              </span>
            )}
            {status === "error" && (
              <>
                Couldn&apos;t subscribe automatically —{" "}
                <a
                  href={mailto}
                  className="underline transition-colors hover:text-gold"
                >
                  email us and we&apos;ll add you
                </a>
                .
              </>
            )}
            {status !== "ok" &&
              status !== "error" &&
              "We won't share your address. Unsubscribe any time."}
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Footer() {
  const { settings, email, emailHref, phone, phoneHref, address, socialItems } = useSiteInfo();
  const siteName = settings.site?.name || SITE.name;
  return (
    <footer className="relative overflow-hidden bg-primary-deep text-white/75">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "560px auto",
        }}
      />

      <NewsletterBand contactEmail={email} />

      <div className="container relative pt-20 pb-10 md:pt-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" aria-label={siteName + " home"} className="inline-block">
              <img
                src={logoWhite}
                alt={siteName + " logo"}
                className="h-14 w-auto"
              />
            </Link>
            <p className="mt-6 text-[15px] leading-relaxed text-white/60">
              Serving the Muslim community of Lakemba and Sydney — a house of
              worship, a courtyard of learning, upon the Qur'an and the authentic
              Sunnah.
            </p>
            <div className="mt-7 flex gap-3">
              {socialItems.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-primary-deep"
                >
                  <s.icon size={18} weight="fill" />
                </a>
              ))}
            </div>
          </div>

          {/* Visit */}
          <div>
            <ColHeading>Visit</ColHeading>
            <p className="font-heading text-[17px] leading-snug font-medium text-white">
              {address}
            </p>
            <ul className="mt-5 flex flex-col gap-3 text-[14.5px]">
              <li>
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-gold"
                >
                  <Phone size={14} weight="bold" className="text-gold/80" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={emailHref}
                  className="inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-gold"
                >
                  <EnvelopeSimple size={14} weight="bold" className="text-gold/80" />
                  {email}
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/Masjid+As-Sunnah+132+Haldon+St+Lakemba"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-gold"
                >
                  <MapPin size={14} weight="bold" className="text-gold/80" />
                  Get Directions
                </a>
              </li>
            </ul>
            <p className="mt-7 mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
              Jumu&apos;ah
            </p>
            <p className="text-[14.5px] text-white/65">
              Khutbah every Friday, 1:15 PM
            </p>
          </div>

          {/* Pages */}
          <div>
            <ColHeading>Pages</ColHeading>
            <ul className="flex flex-col gap-3 text-[14.5px]">
              {PAGE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="inline-block text-white/65 transition-all duration-300 hover:translate-x-1 hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colleges */}
          <div>
            <ColHeading>Colleges</ColHeading>
            <ul className="flex flex-col gap-3 text-[14.5px]">
              {COLLEGE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="inline-block text-white/65 transition-all duration-300 hover:translate-x-1 hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 border-t border-white/10 pt-7 text-[12.5px] text-white/45 md:flex-row md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE.org} &middot; {siteName}.
            All rights reserved.
          </p>
          <p className="tracking-[0.18em] uppercase">
            132&ndash;136 Haldon St &middot; Lakemba NSW
          </p>
        </div>
      </div>
    </footer>
  );
}
