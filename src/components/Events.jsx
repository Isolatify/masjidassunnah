import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CalendarX,
  CalendarBlank,
  MapPin,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import Reveal from "./Reveal";
import { supabase } from "../lib/supabase";
import { useSettings } from "../lib/siteSettings";

const DEFAULT_MAX_EVENTS = 7;

/* An event counts as upcoming if any of its dates are today or later. */
function isUpcoming(ev) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const list = ev.dates_json?.length
    ? ev.dates_json
    : [{ date_start: ev.date_start, date_end: ev.date_end }];
  const spans = list.some((x) => {
    if (!x?.date_start) return false;
    const s = new Date(x.date_start + "T12:00:00");
    if (isNaN(s.getTime())) return false;
    const e =
      x.date_end && x.date_end !== x.date_start
        ? new Date(x.date_end + "T12:00:00")
        : s;
    return !isNaN(e.getTime()) && e >= start;
  });
  if (spans) return true;
  if (ev.date_start) {
    const s = new Date(ev.date_start + "T12:00:00");
    const e =
      ev.date_end && ev.date_end !== ev.date_start
        ? new Date(ev.date_end + "T12:00:00")
        : s;
    return !isNaN(e.getTime()) && e >= start;
  }
  return false;
}

function nextDate(ev) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const list = ev.dates_json?.length
    ? ev.dates_json
    : [{ date_start: ev.date_start, date_end: ev.date_end }];
  const days = [];
  list.forEach((x) => {
    if (!x?.date_start) return;
    const s = new Date(x.date_start + "T12:00:00");
    if (!isNaN(s.getTime()) && s >= start) days.push(s.getTime());
  });
  if (ev.date_start) {
    const s = new Date(ev.date_start + "T12:00:00");
    if (!isNaN(s.getTime()) && s >= start) days.push(s.getTime());
  }
  return days.length ? Math.min(...days) : Number.MAX_SAFE_INTEGER;
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const trackRef = useRef(null);
  const settings = useSettings();
  const homeMax = Number(settings.events?.homeMax) || DEFAULT_MAX_EVENTS;
  const upcomingOnly = settings.events?.upcomingOnly !== false;

  function scrollByCard(dir) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card
      ? card.getBoundingClientRect().width + 24
      : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  // Arrows reflect the track position (disabled at either end).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [loading, events.length]);

  useEffect(() => {
    supabase
      .from("events")
      .select(
        "id, title, slug, description, cover_image, image_url, date_start, date_end, audience, dates_json, location"
      )
      .eq("status", "published")
      .order("date_start", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEvents(
            data
              .filter((ev) => (upcomingOnly ? isUpcoming(ev) : true))
              .sort((a, b) => nextDate(a) - nextDate(b))
              .slice(0, homeMax)
          );
        }
      })
      .finally(() => setLoading(false));
  }, [homeMax, upcomingOnly]);

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  }

  function getDisplayDate(ev) {
    if (ev.dates_json?.[0]?.display) return ev.dates_json[0].display;
    if (ev.date_end && ev.date_end !== ev.date_start)
      return `${formatDate(ev.date_start)} – ${formatDate(ev.date_end)}`;
    return formatDate(ev.date_start);
  }

  function getBadge(audience) {
    const a = audience || [];
    if (a.includes("All") || a.length === 0) return "OPEN TO ALL";
    if (a.length === 1) return a[0].toUpperCase();
    return a.join(", ").toUpperCase();
  }

  return (
    <section className="section section-pattern bg-bg-slab" id="events">
      <div className="container">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="eyebrow">Events</span>
            <h2 className="section-title">Upcoming Events</h2>
          </Reveal>
          <Reveal delay={100} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
                aria-label="Previous events"
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-surface disabled:hover:text-ink"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
                aria-label="Next events"
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-surface disabled:hover:text-ink"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 font-heading text-[13.5px] font-medium text-ink transition-all duration-300 hover:border-primary hover:text-primary"
            >
              View all events
              <ArrowRight
                size={14}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>
        </div>

        {loading ? (
          <div className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[80vw] shrink-0 animate-pulse overflow-hidden rounded-2xl border border-line-soft bg-surface sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]"
              >
                <div className="h-48 bg-bg-slab" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-3/4 rounded bg-bg-slab" />
                  <div className="h-4 w-full rounded bg-bg-slab" />
                  <div className="h-4 w-1/2 rounded bg-bg-slab" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Reveal
            delay={120}
            className="mx-auto max-w-lg rounded-2xl border border-dashed border-line bg-surface px-8 py-14 text-center"
          >
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-mist text-primary">
              <CalendarX size={32} weight="duotone" />
            </span>
            <h3 className="mt-6 font-heading text-xl font-semibold">
              There are no upcoming events
            </h3>
            <p className="mt-2 text-[15px] text-muted">
              New events will be announced here soon. Follow our social media
              for the latest updates.
            </p>
          </Reveal>
        ) : (
          <div
            ref={trackRef}
            className="no-scrollbar -mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-6 overflow-x-auto px-6 pb-2 sm:mx-0 sm:scroll-pl-0 sm:px-0"
          >
            {events.map((ev, i) => (
              <Reveal
                key={ev.id}
                delay={i * 100}
                tilt
                data-card
                className="group flex w-[80vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line-soft bg-surface hover:-translate-y-1.5 hover:border-primary-mist hover:shadow-lg sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]"
              >
                <div className="relative h-48 overflow-hidden bg-bg-slab">
                  {(ev.cover_image || ev.image_url) && (
                    <img
                      src={ev.cover_image || ev.image_url}
                      alt={ev.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <span className="absolute top-4 left-4 rounded-full bg-primary-deep/85 px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                    {getBadge(ev.audience)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-heading text-xl leading-snug font-semibold text-ink">
                    {ev.title}
                  </h3>
                  {ev.description && (
                    <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-relaxed text-muted">
                      {ev.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-1.5 text-[13.5px] text-ink-soft">
                    <span className="flex items-center gap-2">
                      <CalendarBlank
                        size={14}
                        weight="duotone"
                        className="text-gold-deep"
                      />
                      {getDisplayDate(ev)}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-2">
                        <MapPin
                          size={14}
                          weight="duotone"
                          className="text-gold-deep"
                        />
                        {ev.location}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/events/${ev.slug}`}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary-deep px-6 py-3 font-heading text-[13px] font-medium text-white transition-all duration-300 group-hover:bg-primary"
                  >
                    View Details
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
