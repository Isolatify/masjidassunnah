import {
  BookOpen,
  UsersThree,
  MapPin,
  Phone,
  ChalkboardTeacher,
  Globe,
  ArrowSquareOut,
  Clock,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Tilt3D from "../components/Tilt3D";
import heroBg from "../assets/photos/library-shelf.jpg";

const ICOA_PROGRAMS = [
  {
    icon: BookOpen,
    title: "Quran & Tajweed",
    text: "Learning to recite the Holy Quran with proper tajweed rules, developing fluency and understanding of the sacred text.",
  },
  {
    icon: ChalkboardTeacher,
    title: "Islamic Studies",
    text: "Comprehensive Islamic education covering Aqeedah, Fiqh, Seerah, Hadith and Islamic ethics — building strong knowledge and character.",
  },
  {
    icon: Globe,
    title: "Arabic Language",
    text: "Classical and modern Arabic language instruction, enabling students to engage with the Quran, Islamic texts and the wider Arabic-speaking world.",
  },
  {
    icon: UsersThree,
    title: "Youth Programs",
    text: "Mentoring, Tarbiyyah workshops, leadership development and community activities designed to empower young Muslims.",
  },
];

const PILLARS = [
  { num: "Quran", label: "At the centre" },
  { num: "Tarbiyyah", label: "Character building" },
  { num: "Excellence", label: "In every subject" },
  { num: "Community", label: "First approach" },
];

export default function ICOAPage() {
  return (
    <>
      <PageHero
        bg={heroBg}
        eyebrow="Islamic College of Australia"
        title="Knowledge & Character"
        sub="Providing quality Islamic education at Masjid As Sunnah — integrating Quran, Arabic and Islamic studies with character development."
      />

      <main id="page">
        {/* ── About + programs ── */}
        <section className="section">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <Reveal>
                  <span className="eyebrow">About ICOA</span>
                  <h2 className="section-title">
                    Empowering Young Muslims
                  </h2>
                  <p className="lede mt-6">
                    The Islamic College of Australia is dedicated to providing
                    quality Islamic education that integrates Quran, Arabic and
                    Islamic studies with character development.
                  </p>
                  <p className="mt-5 text-[15.5px] leading-[1.75] text-ink-soft">
                    Operating from Masjid As Sunnah in Lakemba, our programs are
                    designed to equip students with the knowledge, skills and
                    values they need to thrive as proud Muslims in Australia.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/contact" className="btn btn-primary">
                      Enquire about enrolment
                    </Link>
                    <Link to="/colleges" className="btn btn-secondary">
                      Alfirdaus College
                    </Link>
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  {ICOA_PROGRAMS.map((p, i) => (
                    <Reveal key={p.title} delay={i * 90}>
                      <Tilt3D className="h-full rounded-2xl border border-line-soft bg-surface p-7 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-mist text-primary transition-colors duration-500">
                          <p.icon size={26} weight="duotone" />
                        </span>
                        <h3 className="mt-6 font-heading text-xl font-semibold">
                          {p.title}
                        </h3>
                        <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
                          {p.text}
                        </p>
                      </Tilt3D>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="section section-pattern border-y border-line-soft bg-surface">
          <div className="container">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">Our Location</span>
                <h2 className="section-title">At Masjid As Sunnah</h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="section-sub md:pb-2 md:text-right">
                  Islamic College of Australia operates exclusively from Masjid
                  As Sunnah in Lakemba — the heart of our community.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <div className="h-full rounded-2xl border border-line-soft bg-bg p-8">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
                    <MapPin size={26} weight="duotone" />
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-semibold">
                    Masjid As Sunnah
                  </h3>
                  <p className="mt-2 text-[15px] text-ink-soft">
                    132 Haldon St, Lakemba NSW 2195
                  </p>

                  <ul className="mt-6 space-y-4 border-t border-line pt-6 text-[14.5px]">
                    <li className="flex items-start gap-3">
                      <Phone
                        size={16}
                        weight="bold"
                        className="mt-1 shrink-0 text-gold-deep"
                      />
                      <span className="text-ink-soft">0450 170 170</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock
                        size={16}
                        weight="bold"
                        className="mt-1 shrink-0 text-gold-deep"
                      />
                      <span className="text-ink-soft">
                        Mon–Thu: 9am–2:30pm, 4:30pm–8:30pm
                        <br />
                        Fri: 4:30pm–6:30pm
                      </span>
                    </li>
                  </ul>

                  <a
                    href="https://www.google.com/maps?q=Masjid+As-Sunnah,+132+Haldon+St,+Lakemba+NSW+2195"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary mt-7"
                  >
                    Get directions <ArrowSquareOut size={14} weight="bold" />
                  </a>
                </div>
              </Reveal>

              <div className="lg:col-span-7">
                <div className="grid h-full grid-cols-2 gap-5">
                  {PILLARS.map((p, i) => (
                    <Reveal
                      key={p.label}
                      delay={i * 90}
                      className="flex flex-col justify-center rounded-2xl border border-line-soft bg-bg p-7 transition-colors duration-500 hover:border-primary-mist hover:bg-primary-mist/30"
                    >
                      <span className="font-display text-[clamp(24px,3vw,34px)] leading-tight font-bold text-primary">
                        {p.num}
                      </span>
                      <span className="mt-2 text-[13.5px] tracking-[0.06em] text-muted uppercase">
                        {p.label}
                      </span>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Enrol ── */}
        <section className="relative isolate overflow-hidden bg-primary-deep py-[var(--section-space)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 110%, rgba(3,137,74,0.35), transparent 70%)",
            }}
          />
          <div className="container relative">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.32em] text-gold uppercase">
                <i className="h-px w-8 bg-gold/70" />
                Enrol Today
                <i className="h-px w-8 bg-gold/70" />
              </span>
              <h2 className="font-display text-[clamp(32px,4.5vw,52px)] leading-[1.06] font-bold tracking-[-0.02em] text-white">
                Start Your Journey
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/60">
                Secure your spot today and start your journey towards a bright
                and fulfilling future — contact us for a free information
                session and assessment.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="https://www.facebook.com/islamiccollegeofaus"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-gold"
                >
                  Visit Facebook Page <ArrowSquareOut size={16} weight="bold" />
                </a>
                <a
                  href="https://alfirdaus.com.au/online-expression-of-interest-form/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn border border-white/25 bg-transparent text-white hover:border-gold hover:text-gold"
                >
                  Enrol Now <ArrowSquareOut size={16} weight="bold" />
                </a>
                <Link
                  to="/contact"
                  className="btn border border-white/25 bg-transparent text-white hover:border-gold hover:text-gold"
                >
                  Visit Masjid As Sunnah
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
