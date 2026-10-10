import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarBlank,
  MapPin,
  UsersThree,
  Plus,
  Minus,
  ShareNetwork,
  Link as LinkIcon,
  ArrowRight,
  CurrencyDollar,
  NavigationArrow,
  Clock,
  Sun,
} from "@phosphor-icons/react";
import Reveal from "../components/Reveal";
import ImageLightbox from "../components/ImageLightbox";
import GirihPattern from "../components/GirihPattern";
import { supabase } from "../lib/supabase";
import { fetchWeek } from "../lib/prayerTimes";
import { untilPhraseFor, nextEventDate, isRecurringEntry, recurringLabel, entryOccurrences } from "../lib/eventTime";
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
  "[&>p:first-of-type]:mt-7 [&>p:first-of-type]:text-[19px] [&>p:first-of-type]:leading-[1.55] [&>p:first-of-type]:font-normal [&>p:first-of-type]:text-ink md:[&>p:first-of-type]:text-[22px] " +
  "[&_h2]:mt-9 [&_h2]:font-heading [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:text-ink " +
  "[&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:text-ink " +
  "[&_p]:text-[15.5px] [&_p]:leading-[1.75] " +
  "[&_strong]:font-semibold [&_strong]:text-ink " +
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 " +
  "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 " +
  "[&_img]:my-7 " +
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
  // When the cover already fits a 1920×1080 box, show it uncropped.
  const [coverFit, setCoverFit] = useState(false);

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

  const dates = event.dates_json?.length
    ? event.dates_json
    : event.date_start
      ? [
          {
            date_start: event.date_start,
            date_end: event.date_end || null,
            date_type: event.date_type || null,
            recurring_pattern: event.recurring_pattern || null,
          },
        ]
      : [];
  const faq = event.faq || [];
  const audience = event.audience || [];
  const links = event.links || [];
  const persons = event.persons || [];
  const coverImage = event.full_image || event.cover_image || event.image_url;
  const audienceLabel = audience.includes("All") ? "Open to all" : audience.join(", ");
  const tags = event.tags || [];

  const todayStr = new Date().toLocaleDateString("en-CA");
  const nextRes = nextEventDate(dates, todayStr);
  const primaryIdx = nextRes ? nextRes.idx : -1;
  const primaryDate = nextRes ? dates[nextRes.idx] : dates[0] || null;
  const recurringPrimary = !!primaryDate && isRecurringEntry(primaryDate);
  const nextDate = nextRes?.dateStr || dates[0]?.date_start || null;
  const untilPhrase = nextRes
    ? untilPhraseFor({ ...dates[nextRes.idx], date_start: nextRes.dateStr }, prayerWeek)
    : null;
  const gcalStart = nextDate || "";
  const gcalEnd =
    primaryDate?.date_end &&
    primaryDate.date_end !== primaryDate.date_start &&
    primaryDate.date_end >= gcalStart
      ? primaryDate.date_end
      : gcalStart;

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

  /* One human line for the primary date: start–end for ranges, the next
     occurrence + recurrence label ("· Every Saturday") for recurring. */
  const whenText = !primaryDate
    ? ""
    : primaryDate.date_start
      ? `${formatDateShort(primaryDate.date_start)}${
          primaryDate.date_end && primaryDate.date_end !== primaryDate.date_start
            ? ` – ${formatDateShort(primaryDate.date_end)}`
            : ""
        }${
          recurringPrimary && recurringLabel(primaryDate)
            ? ` · ${recurringLabel(primaryDate)}`
            : ""
        }`
      : primaryDate.display || "";

  /* Expand recurring entries into upcoming dates and surface the soonest few
     across ALL entries — capped at MAX_DATES total so several recurring
     classes can't flood the list. Non-recurring entries pass through as a
     single row each. */
  const MAX_DATES = 4;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const timeLabel = (e) =>
    e.after_prayer
      ? e.after_prayer
      : e.time_start
        ? e.time_end
          ? `${e.time_start} – ${e.time_end}`
          : e.time_start
        : "";
  const candidates = [];
  dates.forEach((entry, srcIdx) => {
    if (isRecurringEntry(entry)) {
      entryOccurrences(entry)
        .filter((d) => d >= todayStart)
        .slice(0, MAX_DATES)
        .forEach((D) => {
          candidates.push({
            __src: srcIdx,
            dateObj: D,
            title: D.toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            sub: [timeLabel(entry), recurringLabel(entry)].filter(Boolean).join(" · "),
          });
        });
    } else {
      const dateObj = entry.date_start ? new Date(entry.date_start + "T12:00:00") : null;
      candidates.push({
        __src: srcIdx,
        dateObj,
        title:
          entry.display ||
          `${formatDayName(entry.date_start)}${dateObj ? ` ${dateObj.getFullYear()}` : ""}`,
        sub: `${entry.date_start ? formatDateShort(entry.date_start) : ""}${
          entry.date_end ? ` – ${formatDateShort(entry.date_end)}` : ""
        }${recurringLabel(entry) ? ` · ${recurringLabel(entry)}` : ""}`,
      });
    }
  });
  /* Soonest upcoming first; rows without a concrete date sink to the end. */
  candidates.sort((a, b) => {
    const aPast = a.dateObj ? a.dateObj < todayStart : false;
    const bPast = b.dateObj ? b.dateObj < todayStart : false;
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (!a.dateObj && !b.dateObj) return 0;
    if (!a.dateObj) return 1;
    if (!b.dateObj) return -1;
    return a.dateObj - b.dateObj;
  });
  const displayList = candidates.slice(0, MAX_DATES);
  const nextDisplayIdx =
    primaryIdx >= 0 ? displayList.findIndex((r) => r.__src === primaryIdx) : -1;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  const ghostBtn =
    "flex items-center justify-center gap-2 rounded-full border border-white/25 px-3 py-3 text-[10.5px] font-semibold tracking-[0.16em] text-white/80 uppercase transition-colors hover:border-gold hover:text-gold";

  const cardRow = (Icon, label, value) => (
    <div className="flex items-start gap-4 py-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06]">
        <Icon size={17} weight="duotone" className="text-gold" />
      </span>
      <div className="min-w-0">
        <span className="block text-[10.5px] font-medium tracking-[0.2em] text-white/45 uppercase">
          {label}
        </span>
        <div className="mt-1 text-[15px] break-words text-white">{value}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Full-bleed artwork hero (16:9), nav floats over it ── */}
      <section className="relative bg-primary-strong">
        <button
          type="button"
          onClick={() => event.full_image && setLightbox(true)}
          aria-label="View full size image"
          className={`relative block w-full overflow-hidden ${event.full_image ? "cursor-zoom-in" : "cursor-default"}`}
        >
          {coverFit && (
            <img
              src={coverImage || defaultBg}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            />
          )}
          <img
            src={coverImage || defaultBg}
            alt={event.title}
            onLoad={(e) => {
              const img = e.currentTarget;
              setCoverFit(
                img.naturalWidth > 0 &&
                  img.naturalWidth <= 1920 &&
                  img.naturalHeight <= 1080,
              );
            }}
            className={`relative ${coverFit ? "object-contain" : "kenburns object-cover"} h-[min(56.25vw,780px)] w-full object-center`}
          />
        </button>
      </section>

      {/* ── Title band (dark, patterned) ── */}
      <section className="relative overflow-hidden bg-primary-strong">
        <GirihPattern className="pointer-events-none absolute inset-0" />
        <div className="container relative z-10 pt-9 pb-11 md:pt-12 md:pb-14">
          {(audience.length > 0 || tags.length > 0) && (
            <div className="rise flex flex-wrap gap-2.5" style={{ animationDelay: "0.05s" }}>
              {tags.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white/85 uppercase">
                  {tags[0]}
                </span>
              )}
              {audience.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white/85 uppercase"
                >
                  <i className={`h-1.5 w-1.5 rounded-full ${AUDIENCE_DOT[a] || "bg-emerald-400"}`} />
                  {a === "All" ? "Open to all" : a}
                </span>
              ))}
            </div>
          )}

          <h1
            className="rise mt-6 max-w-3xl font-display text-[clamp(28px,5vw,54px)] leading-[1.03] font-normal tracking-[-0.02em] text-[#f7f9f6]"
            style={{ animationDelay: "0.12s" }}
          >
            {event.title}
          </h1>

          {event.description && (
            <p
              className="rise mt-5 text-[13px] font-medium tracking-[0.22em] text-gold uppercase md:text-[15px]"
              style={{ animationDelay: "0.2s" }}
            >
              {event.description}
            </p>
          )}

          {dates.length > 0 && (
            <div
              className="rise mt-6 flex flex-wrap items-center gap-2.5 text-[12.5px] font-medium tracking-[0.18em] text-white/85 uppercase md:text-[13.5px]"
              style={{ animationDelay: "0.28s" }}
            >
              <CalendarBlank size={16} weight="duotone" className="text-gold" />
              {whenText}
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <main id="page">
        <section className="section">
          <div className="container">
            <Reveal>
              <Link
                to="/events"
                className="group inline-flex items-center gap-2.5 text-[12px] font-medium tracking-[0.18em] text-primary-soft uppercase transition-colors hover:text-primary"
              >
                <ArrowLeft
                  size={14}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />
                Back to all events
              </Link>
            </Reveal>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_376px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_400px]">
              {/* Left: content (second on mobile — card leads, like the reference) */}
              <div className="order-2 min-w-0 lg:order-1">
                <Reveal>
                  <span className="flex items-center gap-3 text-[11.5px] font-medium tracking-[0.2em] text-primary-soft uppercase">
                    <Sun size={14} weight="fill" />
                    About this event
                  </span>
                </Reveal>

                {event.content_html && (
                  <Reveal delay={40}>
                    <div
                      className={PROSE}
                      dangerouslySetInnerHTML={{ __html: event.content_html }}
                    />
                  </Reveal>
                )}

                {!event.content_html && !event.description && (
                  <Reveal delay={60}>
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
                          className="flex items-center gap-4 border border-line-soft bg-surface px-5 py-4"
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
                      <div className="mt-4 overflow-hidden border border-line-soft bg-surface">
                        {displayList.map((row, i) => {
                          const isNext = i === nextDisplayIdx && untilPhrase !== null;
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
                              <span className="grid h-16 w-16 shrink-0 place-items-center border border-line bg-bg text-center leading-none">
                                <span className="font-display text-2xl font-bold text-primary">
                                  {row.dateObj ? row.dateObj.getDate() : "–"}
                                </span>
                                <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                                  {row.dateObj
                                    ? row.dateObj.toLocaleDateString("en-AU", {
                                        month: "short",
                                      })
                                    : ""}
                                </span>
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-heading text-[15.5px] font-semibold">
                                  {row.title}
                                </div>
                                <div className="mt-0.5 text-[13.5px] text-muted">
                                  {row.sub}
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
                              className="flex w-full items-start justify-between gap-5 py-5 text-left"
                              onClick={() =>
                                setOpenFaq(openFaq === i ? null : i)
                              }
                              aria-expanded={openFaq === i}
                            >
                              <span className="font-heading text-[15.5px] font-semibold text-ink">
                                {f.question}
                              </span>
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-primary transition-colors hover:border-primary">
                                {openFaq === i ? (
                                  <Minus size={14} weight="bold" />
                                ) : (
                                  <Plus size={14} weight="bold" />
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
                        <span key={i} className="chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                )}
              </div>

              {/* Right: sidebar card (first on mobile) */}
              <div className="order-1 min-w-0 lg:order-2">
                <Reveal delay={40} className="lg:h-full">
                  <div className="relative overflow-hidden bg-[#0c1510] text-white shadow-xl lg:sticky lg:top-28">
                    <GirihPattern className="pointer-events-none absolute inset-0" />
                    <div className="relative p-7 md:p-8">
                      <p className="text-[11px] font-medium tracking-[0.26em] text-gold uppercase">
                        Next Date
                      </p>
                      <p className="mt-3 font-display text-[28px] leading-tight font-normal text-[#f7f9f6]">
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
                        <p className="mt-2.5 block text-[11.5px] font-medium tracking-[0.26em] text-white/55 uppercase">
                          {untilPhrase === "Today"
                            ? "Today"
                            : `In ${untilPhrase}`}
                        </p>
                      )}

                      <div className="mt-6 border-t border-white/10">
                        {audienceLabel && cardRow(UsersThree, "Audience", audienceLabel)}
                        {dates.length > 0 &&
                          cardRow(
                            CalendarBlank,
                            "When",
                            whenText,
                          )}
                        {event.location && cardRow(MapPin, "Where", event.location)}
                        {!isFreeCost(event.cost) &&
                          cardRow(CurrencyDollar, "Cost", event.cost)}
                      </div>

                      <div className="mt-3 space-y-4">
                        {hasRegister && (
                          <>
                            {(countdown || registerNotes.length > 0) && (
                              <div className="space-y-1.5 border border-gold/30 bg-gold/10 px-4 py-3">
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
                                    className="btn btn-gold w-full min-h-[52px] text-[12.5px] tracking-[0.2em]"
                                  >
                                    Register now{" "}
                                    <ArrowRight size={15} weight="bold" />
                                  </Link>
                                ) : (
                                  <a
                                    href={event.register_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-gold w-full min-h-[52px] text-[12.5px] tracking-[0.2em]"
                                  >
                                    Register now{" "}
                                    <ArrowRight size={15} weight="bold" />
                                  </a>
                                )}
                                <p className="text-center text-[12.5px] text-white/50">
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
                                className="group flex items-center justify-between gap-3 border border-white/15 bg-white/5 px-4 py-3 text-[13.5px] font-medium text-white/85 transition-all duration-300 hover:border-gold hover:text-gold"
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <LinkIcon
                                    size={15}
                                    weight="duotone"
                                    className="shrink-0 text-gold"
                                  />
                                  <span className="truncate">
                                    {link.label || link.url}
                                  </span>
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
                      </div>

                      <div className="mt-6 border-t border-white/10 pt-5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <a
                            href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                              event.title,
                            )}&dates=${(gcalStart || "").replace(/-/g, "")}/${(
                              gcalEnd || ""
                            ).replace(/-/g, "")}&location=${encodeURIComponent(
                              event.location || "",
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={ghostBtn}
                          >
                            <CalendarBlank size={15} weight="duotone" className="text-gold" />
                            Calendar
                          </a>
                          <button onClick={handleShare} className={ghostBtn}>
                            <ShareNetwork size={15} weight="duotone" className="text-gold" />
                            Share
                          </button>
                          {showDirections && (
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${ghostBtn} col-span-2`}
                            >
                              <NavigationArrow
                                size={15}
                                weight="duotone"
                                className="text-gold"
                              />
                              Directions
                            </a>
                          )}
                        </div>

                        <Link
                          to="/contact"
                          className="mt-5 flex items-center justify-center gap-2 text-[11.5px] font-medium tracking-[0.2em] text-white/70 uppercase transition-colors hover:text-gold"
                        >
                          Ask about this event
                          <ArrowRight size={13} weight="bold" />
                        </Link>
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
