import {
  Mosque,
  BookOpen,
  UsersThree,
  HandHeart,
  GraduationCap,
  AirplaneInFlight,
  Trophy,
  MapPinArea,
  CalendarCheck,
  ChalkboardTeacher,
  ArrowRight,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Tilt3D from "../components/Tilt3D";
import storyPhoto from "../assets/photos/hall-minbar-person.jpg";
import bandPhoto from "../assets/photos/exterior.jpg";
import heroPhoto from "../assets/photos/about-hero.jpg";

const STORY = [
  "Masjid As Sunnah is operated by the Sunnah Foundation, an organisation at the heart of Australia's Muslim community for over three decades. Our centre is dedicated to the worship of Allah, upon the Qur'an and the authentic Sunnah of Prophet Muhammad ﷺ — understood the way of the righteous predecessors.",
  "Our masjid is housed in the Haldon Street Waqf Building — the first-ever Waqf community building in Australia, established through the generous Parents' Waqf and brought to life by Awqaf Australia. From this historic home we serve worshippers, students and families from Lakemba, Sydney and beyond.",
  "Founded by a dedicated group of families, Masjid As Sunnah has grown from a small community musallah into one of Sydney's most recognised Islamic centres. Our mission is to spread authentic Islamic knowledge, nurture strong Islamic character and build a united community founded upon sincerity, compassion and adherence to the teachings of Islam.",
];

const STATS = [
  { num: "30+", label: "Years serving the community" },
  { num: "25+", label: "Years guiding Hajj & Umrah" },
  { num: "1st", label: "Waqf building in Australia" },
  { num: "1000s", label: "Of worshippers welcomed" },
];

const BEARINGS = [
  {
    icon: BookOpen,
    title: "Knowledge",
    text: "A commitment to authentic Islamic learning — Qur'an, Sunnah and the way of the Salaf — delivered with clarity and sincerity.",
  },
  {
    icon: UsersThree,
    title: "Community",
    text: "A united family of believers — brothers and sisters, young and old — bound by faith, compassion and a shared purpose.",
  },
  {
    icon: HandHeart,
    title: "Service",
    text: "Caring for the community through worship, guidance, charity, counselling and life-event support — from cradle to grave.",
  },
];

const MILESTONES = [
  {
    icon: Trophy,
    tag: "A Historic Moment",
    title: "Largest Taraweeh in Australian History",
    text: "In April 2023, thousands gathered in Haldon Street for an open-air Taraweeh, held in partnership with Canterbury Bankstown Council's Ramadan Nights festival — the largest Taraweeh prayer ever held in Australia.",
  },
  {
    icon: MapPinArea,
    tag: "A First For Australia",
    title: "The First Waqf Community Building",
    text: "Our home at 132-136 Haldon Street was the first-ever Waqf community building in Australia, established through the Parents' Waqf — a lasting endowment for the Muslim community by Awqaf Australia.",
  },
  {
    icon: GraduationCap,
    tag: "Knowledge & Learning",
    title: "Centres of Islamic Learning",
    text: "The building is home to the Islamic College of Australia and Alfirdaus College, offering Islamic studies, education, mentoring and life-skills programs for all ages.",
  },
  {
    icon: AirplaneInFlight,
    tag: "Over 25 Years",
    title: "Guiding Pilgrims to Hajj & Umrah",
    text: "Sunnah Foundation has guided thousands of pilgrims to the sacred lands for over 25 years, providing trusted scholars and comprehensive spiritual preparation for the journey of a lifetime.",
  },
];

const SERVICES = [
  {
    icon: CalendarCheck,
    title: "Daily Prayers & Jumu'ah",
    text: "Five daily congregational prayers and weekly Jumu'ah with khutbah on Levels 1 & 2 of the Awqaf Australia building.",
    to: "/prayer",
    cta: "View prayer times",
  },
  {
    icon: ChalkboardTeacher,
    title: "Islamic Education",
    text: "Quran classes, Islamic studies, hadith circles and educational programs for all ages.",
    to: "/colleges",
    cta: "Explore our colleges",
  },
  {
    icon: GraduationCap,
    title: "Colleges",
    text: "Home to the Islamic College of Australia and Alfirdaus College, providing Islamic studies, mentoring and life-skills development.",
    to: "/colleges",
    cta: "Explore our colleges",
  },
  {
    icon: AirplaneInFlight,
    title: "Hajj & Umrah",
    text: "Guided pilgrimages to the sacred lands with trusted scholars — over 25 years of experience.",
    to: "https://sunnahhajj.com/",
    external: true,
    cta: "Visit Sunnah Hajj",
  },
  {
    icon: HandHeart,
    title: "Community Support",
    text: "Marriage ceremonies, counselling, youth programs, community events and charitable initiatives.",
    to: "/contact",
    cta: "Get in touch",
  },
];

function DarkEyebrow({ children }) {
  return (
    <span className="mb-4 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.32em] text-gold uppercase">
      <i className="h-px w-8 bg-gold/70" />
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        bg={heroPhoto}
        eyebrow="About Us"
        title="A house of knowledge, a body of teachers."
        sub="Three decades of worship, knowledge and community in the heart of Sydney — upon the Qur'an and the authentic Sunnah."
      />

      <main id="page">
        {/* ── Story ── */}
        <section className="section">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Reveal>
                  <span className="eyebrow">Our Story</span>
                  <h2 className="section-title">
                    Serving The Ummah For Three Decades
                  </h2>
                </Reveal>

                <Reveal delay={80}>
                  <p className="lede mt-7">{STORY[0]}</p>
                </Reveal>

                <div className="mt-7 space-y-5">
                  {STORY.slice(1).map((p, i) => (
                    <Reveal key={i} delay={140 + i * 80}>
                      <p className="text-[15.5px] leading-[1.75] text-ink-soft">
                        {p}
                      </p>
                    </Reveal>
                  ))}
                </div>

                <Reveal delay={260}>
                  <div className="mt-9 flex items-center gap-4 border-t border-line pt-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-mist text-primary">
                      <Mosque size={20} weight="duotone" />
                    </span>
                    <div>
                      <p className="font-heading text-[15px] font-semibold">
                        Operated by the Sunnah Foundation
                      </p>
                      <p className="text-[13.5px] text-muted">
                        Haldon Street Waqf Building · Lakemba, Sydney
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-5">
                <Reveal delay={160}>
                  <div className="arch relative aspect-4/5 overflow-hidden shadow-xl">
                    <img
                      src={storyPhoto}
                      alt="The prayer hall at Masjid As-Sunnah"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/55 via-transparent to-transparent" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft">
                    {STATS.map((s) => (
                      <div
                        key={s.label}
                        className="bg-surface px-5 py-6 transition-colors duration-300 hover:bg-primary-mist/40"
                      >
                        <div className="font-display text-3xl leading-none font-bold text-primary">
                          {s.num}
                        </div>
                        <div className="mt-2 text-[12.5px] leading-snug text-muted">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── The Centre's Bearings ── */}
        <section className="relative isolate overflow-hidden bg-primary-deep py-[var(--section-space)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 50% -10%, rgba(3,137,74,0.35), transparent 70%)",
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl">
              <Reveal>
                <DarkEyebrow>The Centre's Bearings</DarkEyebrow>
                <h2 className="font-display text-[clamp(32px,4.5vw,52px)] leading-[1.06] font-bold tracking-[-0.02em] text-white">
                  What guides everything we do.
                </h2>
              </Reveal>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {BEARINGS.map((b, i) => (
                <Reveal
                  key={b.title}
                  delay={i * 110}
                  tilt
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm hover:-translate-y-1.5 hover:border-gold/45 hover:bg-white/[0.07]"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-primary-deep">
                    <b.icon size={26} weight="duotone" />
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-semibold text-white">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-white/60">
                    {b.text}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Milestones ── */}
        <section className="section">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <Reveal>
                <span className="eyebrow">Milestones</span>
                <h2 className="section-title">A Legacy Of Worship &amp; Service</h2>
                <p className="section-sub">
                  Moments that shaped Masjid As Sunnah — and the community it
                  serves.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {MILESTONES.map((m, i) => (
                <Reveal key={m.title} delay={i * 90}>
                  <Tilt3D as="article" className="group relative h-full overflow-hidden rounded-2xl border border-line-soft bg-surface p-8 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg">
                    <span className="pointer-events-none absolute -top-3 right-6 font-display text-[92px] leading-none font-bold text-primary/[0.06] transition-colors duration-500 group-hover:text-primary/[0.11]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-gold-soft text-gold-deep">
                      <m.icon size={24} weight="duotone" />
                    </span>
                    <p className="relative mt-6 text-[10.5px] font-medium tracking-[0.22em] text-gold-deep uppercase">
                      {m.tag}
                    </p>
                    <h3 className="relative mt-2 font-heading text-[21px] leading-snug font-semibold">
                      {m.title}
                    </h3>
                    <p className="relative mt-3 text-[14.5px] leading-relaxed text-muted">
                      {m.text}
                    </p>
                  </Tilt3D>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Our Home band ── */}
        <section className="relative isolate overflow-hidden">
          <img
            src={bandPhoto}
            alt="Masjid As-Sunnah on Haldon Street, Lakemba"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/90 to-primary-deep/60" />
          <div className="container relative py-20 md:py-28">
            <Reveal className="max-w-2xl">
              <DarkEyebrow>Our Home</DarkEyebrow>
              <p className="font-display text-[clamp(26px,3.4vw,40px)] leading-[1.18] font-bold tracking-[-0.02em] text-white">
                The first Waqf community building in Australia — a lasting
                endowment by the community, for the community.
              </p>
              <p className="mt-6 text-[15px] leading-relaxed text-white/60">
                Levels 1 &amp; 2 of the Awqaf Australia building at 132–136
                Haldon Street, Lakemba — home to our prayer halls, colleges and
                community programs.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="section section-pattern">
          <div className="container">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">What We Offer</span>
                <h2 className="section-title">Our Services</h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="section-sub md:pb-2 md:text-right">
                  From daily prayers to educational programs and community
                  support — we serve the spiritual, educational and social needs
                  of the Muslim community.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s, i) => {
                const CardTag = s.external ? "a" : Link;
                const cardProps = s.external
                  ? { href: s.to, target: "_blank", rel: "noreferrer" }
                  : { to: s.to };
                return (
                <Reveal key={s.title} delay={(i % 3) * 90}>
                  <Tilt3D
                    as={CardTag}
                    {...cardProps}
                    className="group flex h-full flex-col rounded-2xl border border-line-soft bg-surface p-7 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-mist text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                      <s.icon size={26} weight="duotone" />
                    </span>
                    <h3 className="mt-6 font-heading text-xl font-semibold">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
                      {s.text}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
                      {s.cta}
                      <ArrowRight
                        size={13}
                        weight="bold"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </Tilt3D>
                </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
