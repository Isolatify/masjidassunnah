import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarBlank,
  MapPin,
  UsersThree,
  CaretDown,
  CaretUp,
  ShareNetwork,
  Link as LinkIcon,
  ArrowRight,
  CurrencyDollar,
  NavigationArrow,
  Clock,
  ArrowsOut,
} from "@phosphor-icons/react";
import Reveal from "../components/Reveal";
import ImageLightbox from "../components/ImageLightbox";
import { supabase } from "../lib/supabase";
import { fetchWeek } from "../lib/prayerTimes";
import { untilPhraseFor } from "../lib/eventTime";
import defaultBg from "../assets/photos/hall-arches.jpg";

const AUDIENCE_DOT = {
  All: "bg-emerald-400",
  Brothers: "bg-primary-bright",
  Sisters: "bg-pink-400",
  Youth: "bg-blue-400",
  Children: "bg-purple-400",
};

const PROSE =
  "mt-6 space-y-5 text-[15.5px] leading-[1.75] text-ink-soft " +
  "[&_h2]:mt-9 [&_h2]:font-heading [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:text-ink " +
  "[&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:text-ink " +
  "[&_p]:text-[15.5px] [&_p]:leading-[1.75] " +
  "[&_strong]:font-semibold [&_strong]:text-ink " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 " +
  "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 " +
  "[&_img]:my-7 [&_img]:rounded-2xl " +
  "[&_figure]:my-7 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:font-display [&_blockquote]:text-[17px]";

function isFreeCost(cost) {
  return !cost || !cost.trim() || cost.trim().toLowerCase() === "free";
}

function splitDuration(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  const sec = s - m * 60;
  const p = (n) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${p(h)}h ${p(m)}m ${p(sec)}s`;
  if (h > 0) return `${p(h)}h ${p(m)}m ${p(sec)}s`;
  return `${p(m)}m ${p(sec)}s`;
}

function formatClock(dateTs) {
  return new Date(dateTs).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [formInfo, setFormInfo] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError("Event not found");
        else setEvent(data);
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [slug]);

  const formId = event?.form_id;
  useEffect(() => {
    if (!formId) {
      setFormInfo(null);
      return;
    }
    let alive = true;
    supabase
      .from("forms")
      .select("id, slug, status, settings")
      .eq("id", formId)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setFormInfo(data || null);
      })
      .catch(() => {
        if (alive) setFormInfo(null);
      });
    return () => {
      alive = false;
    };
  }, [formId]);

  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Masjid timetable — used to resolve "After Maghrib" style event times.
  const [prayerWeek, setPrayerWeek] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchWeek().then((w) => {
      if (alive) setPrayerWeek(w);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-mist text-primary">
          <CalendarBlank size={30} weight="duotone" />
        </span>
        <p className="text-[16px] text-muted">
          {error || "This event could not be found."}
        </p>
        <Link to="/events" className="btn btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  const dates = event.dates_json || [];
  const faq = event.faq || [];
  const audience = event.audience || [];
  const links = event.links || [];
  const persons = event.persons || [];
  const coverImage = event.full_image || event.cover_image || event.image_url;
  const audienceLabel = audience.includes("All") ? "Open to all" : audience.join(", ");
  const tags = event.tags || [];

  const nextDate = dates[0]?.date_start;
  const untilPhrase = untilPhraseFor(dates[0] || null, prayerWeek);

  const hasRegister = !!(event.form_id || event.register_url);
  const respSettings = formInfo?.settings?.responses || {};
  const startTs = respSettings.start_at
    ? new Date(respSettings.start_at).getTime()
    : NaN;
  const endTs = respSettings.end_at ? new Date(respSettings.end_at).getTime() : NaN;
  const startPending = !isNaN(startTs) && startTs > nowTs;
  const endPending = !isNaN(endTs) && endTs > nowTs;
  const regClosed =
    respSettings.accept === false || (!isNaN(endTs) && endTs <= nowTs);
  const regOpens = startPending && !regClosed;
  const regCloses = endPending && !regClosed && !startPending;

  const countdownTarget = regOpens ? startTs : regCloses ? endTs : null;
  const countdown = countdownTarget
    ? {
        label: regOpens ? "Registration opens in" : "Registration closes in",
        digits: splitDuration(countdownTarget - nowTs),
        absolute: `${regOpens ? "Opens" : "Closes"} ${formatClock(countdownTarget)}`,
      }
    : null;

  const registerNotes = [];
  if (regClosed) {
    registerNotes.push(
      respSettings.accept === false
        ? "Registration is closed."
        : "Registration has closed."
    );
  }
  if (respSettings.max_responses > 0) {
    registerNotes.push(`Limited places — max ${respSettings.max_responses} responses.`);
  }

  const showDirections = !!(event.location_lat != null && event.location_lng != null) || !!event.location;
  const directionsUrl =
    event.location_lat != null && event.location_lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${event.location_lat},${event.location_lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location || "")}`;

  function formatDateShort(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDayName(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-AU", { weekday: "long" });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative isolate flex min-h-[54svh] items-end overflow-hidden bg-primary-deep">
        <img
          src={coverImage || defaultBg}
          alt=""
          className="kenburns absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* MIA atmospheric hero: dark wash + gradient — artwork reads as texture only */}
        <div className="absolute inset-0 bg-primary-deep/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/55 via-primary-deep/50 to-primary-deep/95" />

        <div className="container relative z-10 pt-32 pb-14 md:pb-16">
          {audience.length > 0 && (
            <div
              className="rise flex flex-wrap gap-2"
              style={{ animationDelay: "0.1s" }}
            >
              {audience.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-strong/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] text-white/90 uppercase backdrop-blur-sm"
                >
                  <i
                    className={`h-1.5 w-1.5 rounded-full ${AUDIENCE_DOT[a] || "bg-emerald-400"}`}
                  />
                  {a}
                </span>
              ))}
            </div>
          )}

          <h1
            className="rise mt-5 max-w-4xl text-[clamp(34px,5vw,64px)] leading-[1.15] font-semibold tracking-[-0.038em] text-white"
            style={{ animationDelay: "0.2s" }}
          >
            {event.title}
          </h1>

          {event.description && (
            <p
              className="rise mt-4 font-heading text-[12px] font-medium tracking-[0.18em] text-gold uppercase"
              style={{ animationDelay: "0.3s" }}
            >
              {event.description}
            </p>
          )}

          {dates.length > 0 && (
            <div
              className="rise mt-5 inline-flex items-center gap-2.5 text-[12px] font-medium tracking-[0.14em] text-white uppercase"
              style={{ animationDelay: "0.4s" }}
            >
              <CalendarBlank size={16} weight="duotone" className="text-gold" />
              {dates[0].date_start
                ? `${formatDateShort(dates[0].date_start)}${
                    dates[0].date_end ? ` – ${formatDateShort(dates[0].date_end)}` : ""
                  }`
                : dates[0].display}
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <main id="page">
        <section className="section">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Left: content */}
              <div className="lg:col-span-7 xl:col-span-8">
                <Reveal>
                  <Link
                    to="/events"
                    className="group inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-muted uppercase transition-colors hover:text-primary"
                  >
                    <ArrowLeft
                      size={13}
                      weight="bold"
                      className="transition-transform duration-300 group-hover:-translate-x-0.5"
                    />
                    Back to all events
                  </Link>
                </Reveal>

                <Reveal delay={40}>
                  <span className="eyebrow mt-7">About this event</span>
                </Reveal>

                {event.content_html && (
                  <Reveal delay={60}>
                    <div
                      className={PROSE}
                      dangerouslySetInnerHTML={{ __html: event.content_html }}
                    />
                  </Reveal>
                )}

                {!event.content_html && !event.description && (
                  <Reveal delay={80}>
                    <p className="mt-4 text-[15px] text-muted italic">
                      No description available for this event.
                    </p>
                  </Reveal>
                )}

                {/* Persons */}
                {persons.length > 0 && (
                  <Reveal delay={90}>
                    <div className="mt-10 flex flex-wrap gap-4">
                      {persons.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-2xl border border-line-soft bg-surface px-5 py-4"
                        >
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-mist font-heading text-lg font-semibold text-primary">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-heading text-[15px] font-semibold">
                              {p.name}
                            </div>
                            {p.role && (
                              <div className="text-[13px] text-muted">
                                {p.role}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                )}

                {/* Dates */}
                {dates.length > 0 && (
                  <Reveal delay={100}>
                    <div className="mt-10">
                      <span className="eyebrow">Dates</span>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-line-soft bg-surface">
                        {dates.map((d, i) => {
                          const dateObj = d.date_start
                            ? new Date(d.date_start + "T12:00:00")
                            : null;
                          const isNext = i === 0 && untilPhrase !== null;
                          return (
                            <div
                              key={i}
                              className={`relative flex flex-wrap items-center gap-5 px-6 py-5 ${
                                i ? "border-t border-line-soft" : ""
                              } ${isNext ? "bg-primary-mist/35" : ""}`}
                            >
                              {isNext && (
                                <span
                                  aria-hidden
                                  className="absolute inset-y-0 left-0 w-[3px] bg-gold"
                                />
                              )}
                              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-line bg-bg text-center leading-none">
                                <span className="font-display text-2xl font-bold text-primary">
                                  {dateObj ? dateObj.getDate() : "–"}
                                </span>
                                <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                                  {dateObj
                                    ? dateObj.toLocaleDateString("en-AU", {
                                        month: "short",
                                      })
                                    : ""}
                                </span>
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-heading text-[15.5px] font-semibold">
                                  {d.display ||
                                    `${formatDayName(d.date_start)}${
                                      dateObj ? ` ${dateObj.getFullYear()}` : ""
                                    }`}
                                </div>
                                <div className="mt-0.5 text-[13.5px] text-muted">
                                  {d.date_start && formatDateShort(d.date_start)}
                                  {d.date_end
                                    ? ` – ${formatDateShort(d.date_end)}`
                                    : ""}
                                  {d.recurring_pattern
                                    ? ` · ${d.recurring_pattern}`
                                    : ""}
                                </div>
                              </div>
                              {isNext && (
                                <span className="rounded-full bg-gold px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-primary-deep uppercase">
                                  {untilPhrase === "Today"
                                    ? "Today"
                                    : `Next · in ${untilPhrase}`}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Reveal>
                )}

                {/* FAQ */}
                {faq.length > 0 && (
                  <Reveal delay={120}>
                    <div className="mt-10">
                      <span className="eyebrow">Frequently Asked</span>
                      <div className="mt-4 border-y border-line-soft">
                        {faq.map((f, i) => (
                          <div
                            key={i}
                            className={i ? "border-t border-line-soft" : ""}
                          >
                            <button
                              className="flex w-full items-center justify-between gap-4 py-5 text-left"
                              onClick={() =>
                                setOpenFaq(openFaq === i ? null : i)
                              }
                              aria-expanded={openFaq === i}
                            >
                              <span className="font-heading text-[15.5px] font-medium text-ink">
                                {f.question}
                              </span>
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-mist text-primary">
                                {openFaq === i ? (
                                  <CaretUp size={15} weight="bold" />
                                ) : (
                                  <CaretDown size={15} weight="bold" />
                                )}
                              </span>
                            </button>
                            {openFaq === i && (
                              <div className="pb-5 text-[14.5px] leading-relaxed text-muted">
                                {f.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <Reveal delay={140}>
                    <div className="mt-10 flex flex-wrap gap-2.5">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="chip"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                )}
              </div>

              {/* Right: sidebar */}
              <div className="lg:col-span-5 xl:col-span-4">
                {/* Full picture (entire image, uncropped) — tap to enlarge */}
                {event.full_image && (
                  <Reveal delay={40}>
                    <button
                      type="button"
                      onClick={() => setLightbox(true)}
                      aria-label="View full size image"
                      className="group relative mb-6 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-line-soft bg-bg shadow-lg transition-shadow hover:shadow-xl"
                    >
                      <img
                        src={event.full_image}
                        alt={event.title}
                        className="block max-h-[42vh] w-full object-contain"
                      />
                      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="rounded-full bg-black/55 px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                          Tap to enlarge
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                          <ArrowsOut size={15} weight="bold" />
                        </span>
                      </span>
                    </button>
                  </Reveal>
                )}

                <Reveal delay={60}>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-primary-deep text-white shadow-xl lg:sticky lg:top-28">
                    <div className="border-b border-white/10 px-7 pt-7 pb-6">
                      <p className="text-[11px] font-medium tracking-[0.24em] text-gold uppercase">
                        Next Date
                      </p>
                      <p className="mt-3 font-display text-[24px] leading-snug font-semibold">
                        {nextDate
                          ? new Date(nextDate + "T12:00:00").toLocaleDateString(
                              "en-AU",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "TBA"}
                      </p>
                      {untilPhrase !== null && (
                        <p className="mt-3 block text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
                          {untilPhrase === "Today"
                            ? "Today"
                            : `In ${untilPhrase}`}
                        </p>
                      )}
                    </div>

                    <div className="divide-y divide-white/10">
                      {audienceLabel && (
                        <div className="flex items-start gap-4 px-7 py-5">
                          <UsersThree
                            size={18}
                            weight="duotone"
                            className="mt-1 shrink-0 text-gold"
                          />
                          <div>
                            <span className="block text-[10.5px] font-medium tracking-[0.18em] text-white/45 uppercase">
                              Audience
                            </span>
                            <div className="mt-1 text-[14.5px] font-medium text-white">
                              {audienceLabel}
                            </div>
                          </div>
                        </div>
                      )}

                      {dates.length > 0 && (
                        <div className="flex items-start gap-4 px-7 py-5">
                          <CalendarBlank
                            size={18}
                            weight="duotone"
                            className="mt-1 shrink-0 text-gold"
                          />
                          <div>
                            <span className="block text-[10.5px] font-medium tracking-[0.18em] text-white/45 uppercase">
                              When
                            </span>
                            <div className="mt-1 text-[14.5px] font-medium text-white">
                              {dates[0].date_start
                                ? `${formatDateShort(dates[0].date_start)}${
                                    dates[0].date_end
                                      ? ` – ${formatDateShort(dates[0].date_end)}`
                                      : ""
                                  }`
                                : dates[0].display}
                            </div>
                          </div>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-start gap-4 px-7 py-5">
                          <MapPin
                            size={18}
                            weight="duotone"
                            className="mt-1 shrink-0 text-gold"
                          />
                          <div>
                            <span className="block text-[10.5px] font-medium tracking-[0.18em] text-white/45 uppercase">
                              Where
                            </span>
                            <div className="mt-1 text-[14.5px] font-medium text-white">
                              {event.location}
                            </div>
                          </div>
                        </div>
                      )}

                      {!isFreeCost(event.cost) && (
                        <div className="flex items-start gap-4 px-7 py-5">
                          <CurrencyDollar
                            size={18}
                            weight="duotone"
                            className="mt-1 shrink-0 text-gold"
                          />
                          <div>
                            <span className="block text-[10.5px] font-medium tracking-[0.18em] text-white/45 uppercase">
                              Cost
                            </span>
                            <div className="mt-1 text-[14.5px] font-medium text-white">
                              {event.cost}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 px-7 py-6">
                      {hasRegister && (
                        <>
                          {(countdown || registerNotes.length > 0) && (
                            <div className="space-y-1.5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3">
                              {countdown && (
                                <div className="pb-1.5">
                                  <p className="text-[10.5px] font-semibold tracking-[0.18em] text-gold/85 uppercase">
                                    {countdown.label}
                                  </p>
                                  <p className="font-heading text-[27px] leading-tight font-bold tabular-nums text-white">
                                    {countdown.digits}
                                  </p>
                                  <p className="text-[11.5px] text-white/55">
                                    {countdown.absolute}
                                  </p>
                                </div>
                              )}
                              {registerNotes.map((note, i) => (
                                <p
                                  key={i}
                                  className="flex items-start gap-2 text-[12.5px] leading-snug font-medium text-white/75"
                                >
                                  <Clock
                                    size={13}
                                    weight="duotone"
                                    className="mt-0.5 shrink-0 text-gold"
                                  />
                                  {note}
                                </p>
                              ))}
                            </div>
                          )}
                          {!regClosed && (
                            <>
                              {event.form_id ? (
                                <Link
                                  to={`/events/${event.slug}/register`}
                                  className="btn btn-gold w-full"
                                >
                                  Register now{" "}
                                  <ArrowRight size={14} weight="bold" />
                                </Link>
                              ) : (
                                <a
                                  href={event.register_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-gold w-full"
                                >
                                  Register now{" "}
                                  <ArrowRight size={14} weight="bold" />
                                </a>
                              )}
                              <p className="text-center text-[13px] text-white/55">
                                A few quick details and your place is saved.
                              </p>
                            </>
                          )}
                        </>
                      )}

                      {links.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10.5px] font-medium tracking-[0.18em] text-white/45 uppercase">
                            Links
                          </p>
                          {links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[13.5px] font-medium text-white/85 transition-all duration-300 hover:border-gold hover:text-gold"
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <LinkIcon
                                  size={15}
                                  weight="duotone"
                                  className="shrink-0 text-gold"
                                />
                                <span className="truncate">{link.label || link.url}</span>
                              </span>
                              <ArrowRight
                                size={13}
                                weight="bold"
                                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <a
                          href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                            event.title,
                          )}&dates=${nextDate?.replace(/-/g, "") || ""}/${(
                            event.date_end ||
                            nextDate ||
                            ""
                          ).replace(/-/g, "")}&location=${encodeURIComponent(
                            event.location || "",
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-2.5 py-3 text-[10.5px] font-semibold tracking-[0.1em] text-white/75 uppercase transition-colors hover:border-gold hover:text-gold"
                        >
                          <CalendarBlank size={15} weight="duotone" />
                          Calendar
                        </a>
                        <button
                          onClick={handleShare}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-2.5 py-3 text-[10.5px] font-semibold tracking-[0.1em] text-white/75 uppercase transition-colors hover:border-gold hover:text-gold"
                        >
                          <ShareNetwork size={15} weight="duotone" />
                          Share
                        </button>
                        {showDirections && (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 px-2.5 py-3 text-[10.5px] font-semibold tracking-[0.1em] text-white/75 uppercase transition-colors hover:border-gold hover:text-gold"
                          >
                            <NavigationArrow size={15} weight="duotone" />
                            Directions
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>

      {lightbox && event.full_image && (
        <ImageLightbox
          src={event.full_image}
          alt={event.title}
          caption={event.title}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}
