import {
  GraduationCap,
  BookOpen,
  UsersThree,
  Buildings,
  MapPin,
  Phone,
  Clock,
  ChalkboardTeacher,
  Globe,
  Star,
  Heart,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import alfirdausLogo from "../assets/colleges/alfirdaus-logo.png";
import alfirdausHero from "../assets/colleges/alfirdaus-hero.jpg";

const ALFIRDAUS_PROGRAMS = [
  {
    icon: Star,
    title: "Early Learners",
    ages: "Ages 3–5",
    text: "A gentle introduction to the Quran, Arabic alphabet, supplications and Islamic manners through play-based learning and engaging activities.",
  },
  {
    icon: BookOpen,
    title: "Foundation",
    ages: "Ages 5–10",
    text: "Building a strong foundation in Quran recitation with proper tajweed, basic Islamic studies, Arabic language and daily du'as.",
  },
  {
    icon: ChalkboardTeacher,
    title: "Bridging & Intermediate",
    ages: "Ages 10–17",
    text: "Deepening knowledge of Quran recitation, Islamic studies, Arabic language and character development for young Muslims.",
  },
  {
    icon: GraduationCap,
    title: "Advanced",
    ages: "Ages 14–17",
    text: "Advanced Quran recitation, Islamic sciences, leadership skills and preparation for adult Islamic learning.",
  },
  {
    icon: Globe,
    title: "Classical Arabic",
    ages: "Ages 7+",
    text: "Developing classical Arabic language skills through comprehensible input — reading, listening and speaking in an immersive environment.",
  },
  {
    icon: Heart,
    title: "Quran Memorisation",
    ages: "All Ages",
    text: "Full-time and part-time hifdh programs with dedicated teachers, structured revision schedules and spiritual mentorship.",
  },
];

const ARABIC_PROGRAMS = [
  {
    title: "Adult Beginners",
    text: "Start your Arabic journey from scratch. Learn to read, write and speak Arabic with a structured curriculum designed for adults.",
  },
  {
    title: "Adult Intermediate",
    text: "Build on your foundation with more complex grammar, vocabulary and conversation skills. Begin reading Arabic texts with confidence.",
  },
  {
    title: "Adult Advanced",
    text: "Achieve strong communicative ability and explore core Arabic sciences — grammar, rhetoric and classical texts.",
  },
  {
    title: "Children's Program",
    text: "Age-appropriate Arabic learning for children 8–15 years old, divided into beginner, intermediate and advanced levels.",
  },
];

const CENTRES = [
  {
    name: "Lakemba",
    address: "Masjid As-Sunnah, 132 Haldon St, Lakemba NSW 2195",
    phone: "Early Learners: 0450 170 170 | Foundation: 0474 000 111",
    hours:
      "Mon–Tue: 9am–2:30pm, 4:30pm–8:30pm | Wed: 9am–2:30pm, 4:30pm–6:30pm | Thu: 9am–2:30pm, 4:30pm–8:30pm | Fri: 4:30pm–6:30pm",
    primary: true,
  },
  {
    name: "Bankstown",
    sub: "Head Office",
    address: "Suite 6, 69 The Mall, Bankstown NSW 2200",
    phone: "(02) 9791 6777",
    hours:
      "Mon: 9am–8pm | Tue & Thu: 9am–9pm | Wed: 9am–2:30pm | Fri: 9am–8pm | Sat: 8:30am–4:30pm | Sun: 9am–1pm",
  },
  {
    name: "Bankstown",
    sub: "The Mall",
    address: "Suite 1, 69 The Mall, Bankstown NSW 2200",
    phone: "(02) 9791 6777",
    hours:
      "Mon, Tue & Thu: 9am–8pm | Wed: 9am–2:30pm | Fri: 9am–8pm | Sat: 8:30am–4:30pm | Sun: 9am–1pm",
  },
  {
    name: "Chester Hill",
    address: "274 Miller Road, Villawood NSW 2163",
    phone: "(02) 9892 2446 · 0432 158 550",
    hours:
      "Mon–Thu: 8:45am–3:15pm, 4pm–8:30pm | Fri: 4pm–8:30pm | Sat: 8:30am–4:30pm | Sun: 9am–1pm",
  },
  {
    name: "Blacktown",
    address: "2 Romford Road, Kings Park NSW 2148",
    phone: "0406 243 289",
    hours:
      "Mon–Tue: 9am–2:30pm | Wed–Thu: 9am–2:30pm, 4:30pm–8:30pm | Fri: 4:30pm–8:30pm | Sat: 8:30am–4:30pm",
  },
  {
    name: "Liverpool",
    address: "Suite 5, 72–74 Bathurst St, Liverpool NSW 2170",
    phone: "(02) 9824 0943",
    hours:
      "Mon–Wed: 9am–2:30pm | Thu: 9am–2:30pm, 4:30pm–8:30pm | Fri: 4:30pm–8:30pm | Sat: 8:30am–4:30pm",
  },
  {
    name: "Hurstville",
    address: "Arkana College, 346 Stoney Creek Rd, Kingsgrove NSW 2208",
    phone: "0406 696 944",
    hours: "Fri: 4:30pm–8:30pm | Sat: 8:30am–4pm",
  },
  {
    name: "Austral",
    address: "Unity Grammar, 70 Fourth Ave, Austral NSW 2179",
    phone: "0405 436 844",
    hours: "Wed: 4:15pm–7:15pm",
  },
  {
    name: "Hornsby",
    address: "75 Hunter Street, Hornsby NSW 2077",
    phone: "(02) 9791 6777",
    hours: "Currently closed",
    isClosed: true,
  },
  {
    name: "Melbourne",
    address: "Unit 11, 9 Dawson St, Coburg North VIC 3058",
    phone: "0481 874 942",
    hours:
      "Mon–Thu: 9am–2:30pm | Sat: 8:30am–4:30pm",
    isNew: true,
  },
];

function splitHours(str) {
  return str
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.indexOf(":");
      return i < 0 ? [null, s] : [s.slice(0, i).trim(), s.slice(i + 1).trim()];
    });
}

const VALUES = [
  {
    icon: UsersThree,
    title: "Quality Teachers",
    text: "We focus on recruiting and retaining quality teachers who not only educate students' minds but also touch their hearts.",
  },
  {
    icon: BookOpen,
    title: "Rooted in Quran",
    text: "Our curriculum is built around the Quran and Sunnah, ensuring students develop a strong spiritual foundation alongside academic knowledge.",
  },
  {
    icon: GraduationCap,
    title: "Proven Results",
    text: "From 15 students to thousands — our graduates are devout Muslims who make a positive impact in their communities.",
  },
  {
    icon: Heart,
    title: "Community Focus",
    text: "We serve the community through education, Tarbiyyah programs and a commitment to building a generation guided by Islamic values.",
  },
];

const STATS = [
  { num: "2015", label: "Founded" },
  { num: "7+", label: "Centres across Sydney" },
  { num: "3+", label: "Ages & up" },
  { num: "1000s", label: "Students served" },
];

export default function CollegesPage() {
  return (
    <>
      <PageHero
        bg={alfirdausHero}
        eyebrow="Alfirdaus College"
        title="Rooted in Quran"
        sub="Established in 2015, Alfirdaus has grown from 15 students in Bankstown to thousands across seven centres in Sydney and Melbourne — building a generation rooted in Quran."
      />

      <main id="page">
        {/* ── Story ── */}
        <section className="section">
          <div className="container">
            <Reveal className="mx-auto max-w-3xl text-center">
              <img
                src={alfirdausLogo}
                alt="Alfirdaus College"
                className="mx-auto mb-8 h-16 w-auto"
              />
              <span className="eyebrow">Our Story</span>
              <h2 className="section-title">
                From 15 Students To Thousands
              </h2>
              <p className="section-sub">
                Established in 2015 by seven colleagues from Western Sydney
                with a shared passion for Islamic education. From humble
                beginnings with just 15 students in a small centre in
                Bankstown, Alfirdaus has grown to serve thousands of students
                across seven centres in Sydney — plus a new Melbourne campus.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft md:grid-cols-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-surface px-5 py-7 text-center transition-colors duration-300 hover:bg-primary-mist/40"
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

            <Reveal delay={200}>
              <div className="relative mt-10 overflow-hidden rounded-3xl">
                <img
                  src={alfirdausHero}
                  alt="Alfirdaus College classroom"
                  className="h-[300px] w-full object-cover md:h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-primary-deep/10 to-transparent" />
              </div>
              <div className="mt-7 text-center">
                <a
                  href="https://alfirdaus.com.au/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  Visit Website <ArrowSquareOut size={16} weight="bold" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Programs ── */}
        <section className="section section-pattern border-y border-line-soft bg-surface">
          <div className="container">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">Our Programs</span>
                <h2 className="section-title">
                  Quran, Arabic &amp; Islamic Studies
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="section-sub md:pb-2 md:text-right">
                  At Alfirdaus we offer many programs for all students. Our
                  focus is on developing a student's spiritual knowledge and
                  character — so they correctly apply Islamic principles in
                  their day-to-day lives.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ALFIRDAUS_PROGRAMS.map((p, i) => (
                <Reveal key={p.title} delay={(i % 3) * 90}>
                  <article className="group relative h-full overflow-hidden rounded-2xl border border-line-soft bg-bg p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-mist text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                      <p.icon size={26} weight="duotone" />
                    </span>
                    <span className="mt-6 inline-flex rounded-full bg-gold-soft px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-gold-deep uppercase">
                      {p.ages}
                    </span>
                    <h3 className="mt-3 font-heading text-xl font-semibold">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
                      {p.text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Arabic ── */}
        <section className="section">
          <div className="container">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">Arabic Programs</span>
                <h2 className="section-title">Classical Arabic Language</h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="section-sub md:pb-2 md:text-right">
                  The Alfirdaus Arabic Life program aims to develop a community
                  of classical Arabic speakers using the most effective
                  approach to language acquisition: comprehensible input.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {ARABIC_PROGRAMS.map((a, i) => (
                <Reveal key={a.title} delay={(i % 2) * 90}>
                  <div className="flex h-full gap-5 rounded-2xl border border-line-soft bg-surface p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-mist text-primary">
                      <BookOpen size={22} weight="duotone" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">
                        {a.title}
                      </h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                        {a.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={160}>
              <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-2xl border border-primary-mist bg-primary-mist/40 p-7 md:flex-row md:items-center">
                <p className="max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
                  All Arabic courses are taught by Ustadh Mukhlis Mah and a team
                  of trained Arabic teachers. Separate classes available for men
                  and women.
                </p>
                <a
                  href="https://alfirdaus.com.au/arabic/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary shrink-0"
                >
                  Learn More <ArrowSquareOut size={16} weight="bold" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Centres ── */}
        <section className="section section-pattern border-y border-line-soft bg-surface">
          <div className="container">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">Our Centres</span>
                <h2 className="section-title">Find A Centre Near You</h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="section-sub md:pb-2 md:text-right">
                  With seven centres across Sydney and a new campus in
                  Melbourne, there's an Alfirdaus College near you.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CENTRES.map((c, i) => (
                <Reveal
                  key={c.sub ? `${c.name}-${c.sub}` : c.name}
                  delay={(i % 3) * 80}
                  className="h-full"
                >
                  <article
                    className={`flex h-full flex-col rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${
                      c.primary
                        ? "border-primary/25 bg-primary-mist/40"
                        : c.isClosed
                          ? "border-line-soft bg-bg"
                          : "border-line-soft bg-white hover:border-primary/30"
                    }`}
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                            c.primary
                              ? "bg-primary text-white"
                              : c.isClosed
                                ? "bg-surface text-muted"
                                : "bg-primary-mist text-primary"
                          }`}
                        >
                          <Buildings size={18} weight="bold" />
                        </span>
                        <div>
                          <h3 className="font-heading text-[17px] leading-tight font-semibold">
                            {c.name}
                          </h3>
                          {c.sub && (
                            <p className="mt-1 text-[10.5px] font-bold tracking-[0.16em] text-gold-deep uppercase">
                              {c.sub}
                            </p>
                          )}
                        </div>
                      </div>
                      {c.isNew && (
                        <span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-gold-deep uppercase">
                          New
                        </span>
                      )}
                      {c.isClosed && (
                        <span className="shrink-0 rounded-full border border-line-soft bg-surface px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-muted uppercase">
                          Closed
                        </span>
                      )}
                    </header>

                    <div className="mt-5 space-y-3.5 border-t border-line-soft pt-5">
                      <p className="flex gap-3 text-[14.5px] leading-snug">
                        <MapPin
                          size={15}
                          weight="bold"
                          className="mt-1 shrink-0 text-gold-deep"
                        />
                        <span className="text-ink-soft">{c.address}</span>
                      </p>

                      {c.phone && (
                        <p className="flex gap-3 text-[14px]">
                          <Phone
                            size={15}
                            weight="bold"
                            className="mt-0.5 shrink-0 text-gold-deep"
                          />
                          <span className="space-y-0.5 text-ink-soft">
                            {c.phone.split("|").map((line, idx) => (
                              <span key={idx} className="block">
                                {line.trim()}
                              </span>
                            ))}
                          </span>
                        </p>
                      )}

                      {c.hours && (
                        <div className="flex gap-3">
                          <Clock
                            size={15}
                            weight="bold"
                            className="mt-0.5 shrink-0 text-gold-deep"
                          />
                          <div className="space-y-1">
                            {splitHours(c.hours).map(([days, times], idx) =>
                              days ? (
                                <p
                                  key={idx}
                                  className="flex gap-2 text-[13px] leading-snug"
                                >
                                  <span className="w-[86px] shrink-0 font-semibold text-muted">
                                    {days}
                                  </span>
                                  <span className="text-ink-soft">{times}</span>
                                </p>
                              ) : (
                                <p key={idx} className="text-[13px] text-muted italic">
                                  {times}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto border-t border-line-soft pt-4">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          c.address
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-deep"
                      >
                        View map
                        <ArrowSquareOut size={13} weight="bold" />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Alfirdaus ── */}
        <section className="section">
          <div className="container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Why Alfirdaus?</span>
              <h2 className="section-title">What Makes Us Different</h2>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 90}>
                  <div className="h-full rounded-2xl border border-line-soft bg-surface p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-soft text-gold-deep">
                      <v.icon size={26} weight="duotone" />
                    </span>
                    <h3 className="mt-6 font-heading text-lg font-semibold">
                      {v.title}
                    </h3>
                    <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
                      {v.text}
                    </p>
                  </div>
                </Reveal>
              ))}
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
                Secure your spot today — complete an expression of interest
                form or contact us for a free information session and
                assessment.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="https://alfirdaus.com.au/online-expression-of-interest-form/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-gold"
                >
                  Enrol Now <ArrowSquareOut size={16} weight="bold" />
                </a>
                <a
                  href="https://alfirdaus.com.au/contact/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn border border-white/25 bg-transparent text-white hover:border-gold hover:text-gold"
                >
                  Contact Alfirdaus <ArrowSquareOut size={16} weight="bold" />
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
