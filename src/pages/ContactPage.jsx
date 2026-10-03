import { useState } from "react";
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  CarSimple,
  DoorOpen,
  PaperPlaneTilt,
  CalendarBlank,
  ArrowSquareOut,
  CheckCircle,
} from "@phosphor-icons/react";
import { SITE, MAPS, SOCIALS, PRAYER_WIDGET_URL } from "../config";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";

const CARDS = [
  {
    icon: MapPin,
    title: "Visit Us",
    lines: [SITE.address],
    href: "https://www.google.com/maps?q=Masjid+As-Sunnah,+132+Haldon+St,+Lakemba+NSW+2195",
    linkLabel: "Open in Maps",
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: [SITE.phone],
    href: SITE.phoneHref,
    linkLabel: "Call the masjid",
    external: false,
  },
  {
    icon: EnvelopeSimple,
    title: "Email Us",
    lines: [SITE.email],
    href: SITE.emailHref,
    linkLabel: "Send an email",
    external: false,
  },
];

const ASIDE = [
  {
    icon: CalendarBlank,
    title: "Prayer Times",
    body: (
      <>
        We are open for all five daily prayers, seven days a week. Jumu'ah
        khutbah begins at 12:15 PM.
      </>
    ),
    link: { label: "This week's prayer times", href: PRAYER_WIDGET_URL },
  },
  {
    icon: DoorOpen,
    title: "How To Enter",
    body: (
      <>
        Masjid As Sunnah is located on the upper levels of the Awqaf Australia
        building. Enter through the entrance on the right-hand side and head
        upstairs — Jumu'ah is held on Levels 1 &amp; 2.
      </>
    ),
  },
  {
    icon: CarSimple,
    title: "Parking",
    body: (
      <>
        Street parking is available along Haldon Street and the surrounding
        streets. Paid car parks are within easy walking distance.
      </>
    ),
  },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: SOCIALS.facebook.url },
  { label: "Instagram", href: SOCIALS.instagram.url },
  { label: "YouTube", href: SOCIALS.youtube.url },
];

const FIELD =
  "w-full border-0 border-b border-primary/25 bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = form.subject || `Website enquiry from ${form.name}`;
    const body = `${form.message}\n\n—\n${form.name}\n${form.email}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Get In Touch"
        sub="Questions, feedback or a warm welcome — reach out to the Masjid As Sunnah team."
      />

      <main id="page">
        {/* ── Contact channels ── */}
        <section className="section pb-0">
          <div className="container">
            <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">Contact</span>
                <h2 className="section-title">We're Here To Help</h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="section-sub md:pb-2 md:text-right">
                  The masjid office is contactable seven days a week — or simply
                  drop in during prayer times.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {CARDS.map((c, i) => (
                <Reveal key={c.title} delay={i * 100}>
                  <div className="group flex h-full flex-col rounded-2xl border border-line-soft bg-surface p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-mist text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                      <c.icon size={26} weight="duotone" />
                    </span>
                    <h3 className="mt-6 font-heading text-xl font-semibold">
                      {c.title}
                    </h3>
                    {c.lines.map((line) => (
                      <p key={line} className="mt-1 text-[15px] text-ink-soft">
                        {line}
                      </p>
                    ))}
                    <a
                      href={c.href}
                      target={c.external === false ? undefined : "_blank"}
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary"
                    >
                      {c.linkLabel}
                      <ArrowSquareOut
                        size={14}
                        weight="bold"
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Message form + info ── */}
        <section className="section">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <div className="rounded-2xl border border-line-soft bg-surface p-7 shadow-sm md:p-10">
                  <div className="flex items-start gap-4 border-b border-line-soft pb-6">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white">
                      <PaperPlaneTilt size={22} weight="duotone" />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-semibold">
                        Send Us A Message
                      </h3>
                      <p className="mt-1 text-[14px] text-muted">
                        We usually respond within a few days, in sha Allah.
                      </p>
                    </div>
                  </div>

                  {sent ? (
                    <div className="mt-8 rounded-xl border border-primary-mist bg-primary-mist/40 p-7 text-center">
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
                        <CheckCircle size={26} weight="duotone" />
                      </span>
                      <h4 className="mt-5 font-heading text-lg font-semibold">
                        JazakAllah Khair!
                      </h4>
                      <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
                        Your email app should now be open with your message
                        ready to send to {SITE.email}. If it didn't open, email
                        us directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="btn btn-secondary mt-6"
                      >
                        Write another message
                      </button>
                    </div>
                  ) : (
                    <form className="mt-7 space-y-6" onSubmit={onSubmit}>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                            Your Name
                          </span>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={update}
                            required
                            placeholder="Full name"
                            className={FIELD}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                            Your Email
                          </span>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={update}
                            required
                            placeholder="you@example.com"
                            className={FIELD}
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                          Subject
                        </span>
                        <input
                          type="text"
                          name="subject"
                          value={form.subject}
                          onChange={update}
                          placeholder="How can we help?"
                          className={FIELD}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
                          Message
                        </span>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={update}
                          required
                          rows={5}
                          placeholder="Write your message here…"
                          className={`${FIELD} resize-y`}
                        />
                      </label>

                      <button
                        type="submit"
                        className="btn btn-primary w-full sm:w-auto"
                      >
                        <PaperPlaneTilt size={18} weight="bold" /> Send Message
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>

              <div className="lg:col-span-5">
                <div className="divide-y divide-line-soft overflow-hidden rounded-2xl border border-line-soft bg-surface">
                  {ASIDE.map((a, i) => (
                    <Reveal key={a.title} delay={i * 90}>
                      <div className="flex gap-4 p-7">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-deep">
                          <a.icon size={20} weight="duotone" />
                        </span>
                        <div>
                          <h3 className="font-heading text-[17px] font-semibold">
                            {a.title}
                          </h3>
                          <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
                            {a.body}
                          </p>
                          {a.link && (
                            <a
                              href={a.link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary"
                            >
                              {a.link.label}
                              <ArrowSquareOut size={14} weight="bold" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Maps ── */}
        <section className="section section-pattern pt-0">
          <div className="container">
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal>
                <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
                  <div className="flex items-center gap-3 px-6 py-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-mist text-primary">
                      <MapPin size={18} weight="duotone" />
                    </span>
                    <h3 className="font-heading text-[17px] font-semibold">
                      Masjid As Sunnah
                    </h3>
                  </div>
                  <iframe
                    title="Masjid As Sunnah location"
                    src={MAPS.masjid}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="h-[340px] w-full border-0 border-t border-line-soft"
                  />
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
                  <div className="flex items-center gap-3 px-6 py-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-mist text-primary">
                      <CarSimple size={18} weight="duotone" />
                    </span>
                    <h3 className="font-heading text-[17px] font-semibold">
                      Nearby Carparks
                    </h3>
                  </div>
                  <iframe
                    title="Carparks near Masjid As Sunnah"
                    src={MAPS.parking}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="h-[340px] w-full border-0 border-t border-line-soft"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Socials ── */}
        <section className="bg-primary-deep py-14">
          <div className="container flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <Reveal>
              <p className="font-heading text-[17px] font-medium text-white">
                Follow the masjid for daily updates, events and live broadcasts
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-wrap justify-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13.5px] font-medium text-white/85 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-primary-deep"
                  >
                    {s.label}
                    <ArrowSquareOut size={14} weight="bold" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
