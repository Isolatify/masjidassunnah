import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarBlank,
  CalendarX,
  CalendarCheck,
  MagnifyingGlass,
  MapPin,
  ArrowRight,
  CaretLeft,
  CaretRight,
  SortAscending,
  Clock,
  CurrencyDollar,
} from "@phosphor-icons/react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { supabase } from "../lib/supabase";
import { eventOccurrences, recurringLabel } from "../lib/eventTime";
import { useSettings } from "../lib/siteSettings";
import heroBg from "../assets/photos/hall-people.webp";

const AUDIENCE_FILTERS = ["All", "Brothers", "Sisters", "Youth", "Children"];
const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "calendar", label: "Calendar" },
  { id: "past", label: "Recently passed" },
];
const SORTS = [
  { id: "soonest", label: "Soonest first" },
  { id: "recent", label: "Recently added" },
  { id: "az", label: "Title A–Z" },
];

const DOT = {
  All: "bg-emerald-500",
  Brothers: "bg-primary",
  Sisters: "bg-pink-500",
  Youth: "bg-blue-500",
  Children: "bg-purple-500",
};

/* Same colour code as the badges: green / pink / blue / purple. */
const BADGE_TONE = {
  Brothers: "bg-primary text-white",
  Sisters: "bg-pink-500 text-white",
  Youth: "bg-blue-500 text-white",
  Children: "bg-purple-500 text-white",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfToday() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDisplayDate(ev) {
  const first = ev.dates_json?.[0];
  if (first?.display) {
    const label = recurringLabel(first);
    return label ? `${first.display} · ${label}` : first.display;
  }
  if (ev.recurring_pattern || ev.date_type === "recurring") {
    const label = recurringLabel({
      recurring_pattern: ev.recurring_pattern,
      date_type: ev.date_type,
      date_start: ev.date_start,
      weekdays: first?.weekdays,
    });
    if (label) return label;
  }
  if (ev.date_end && ev.date_end !== ev.date_start)
    return `${formatDate(ev.date_start)} – ${formatDate(ev.date_end)}`;
  return formatDate(ev.date_start);
}

function getBadge(audience) {
  const a = audience || [];
  const neutral = "bg-primary-deep/85 text-white backdrop-blur-sm";
  if (a.includes("All") || a.length === 0)
    return { label: "Open to all", cls: neutral };
  if (a.length === 1)
    return {
      label: `${a[0]} only`,
      cls: BADGE_TONE[a[0]] || neutral,
    };
  return { label: a.join(" & "), cls: neutral };
}

function dotFor(audience) {
  const a = audience || [];
  const first = a.find((x) => DOT[x]);
  return first ? DOT[first] : DOT.All;
}

function isFreeCost(cost) {
  return !cost || !cost.trim() || cost.trim().toLowerCase() === "free";
}

function hasRegisterOption(ev) {
  return !!(ev.form_id || ev.register_url);
}

/* Every calendar day an event spans: ranges expanded day-by-day, recurring
   patterns projected ±1 year around today (see lib/eventTime.js). */
function occurrences(ev) {
  return eventOccurrences(ev);
}

function eventDates(ev) {
  if (ev.__dates) return ev.__dates;
  const d = occurrences(ev);
  ev.__dates = d;
  return d;
}

function decorate(ev) {
  const dates = eventDates(ev);
  const today = startOfToday();
  const upcoming = dates.filter((d) => d >= today);
  const pastDates = dates.filter((d) => d < today);
  const hasDates = dates.length > 0;
  return {
    ...ev,
    __occ: dates,
    __next: upcoming.length ? Math.min(...upcoming) : null,
    __last: pastDates.length ? Math.max(...pastDates) : null,
    __past: hasDates && upcoming.length === 0,
    __created: ev.created_at || ev.inserted_at || ev.date_start || "",
  };
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAudience = searchParams.get("audience");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(
    AUDIENCE_FILTERS.includes(initialAudience) ? initialAudience : "All"
  );
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [sort, setSort] = useState("soonest");
  const [calMonth, setCalMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState(() => dateKey(new Date()));
  const [showAll, setShowAll] = useState(false);

  const setFilter = (f) => {
    setActiveFilter(f);
    const next = new URLSearchParams(searchParams);
    if (f === "All") next.delete("audience");
    else next.set("audience", f);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("date_start", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setEvents((data || []).map(decorate));
      })
      .finally(() => setLoading(false));
  }, []);

  const matchesFilters = (ev) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !ev.title?.toLowerCase().includes(q) &&
        !(ev.description || "").toLowerCase().includes(q) &&
        !(ev.location || "").toLowerCase().includes(q)
      )
        return false;
    }
    if (activeFilter !== "All") {
      const aud = ev.audience || [];
      if (!aud.includes("All") && !aud.includes(activeFilter)) return false;
    }
    return true;
  };

  const filtered = events.filter(matchesFilters);

  const upcoming = useMemo(
    () => filtered.filter((ev) => !ev.__past),
    [filtered]
  );
  const past = useMemo(() => filtered.filter((ev) => ev.__past), [filtered]);

  const sortList = (list) => {
    const arr = [...list];
    if (sort === "az") {
      arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "recent") {
      arr.sort((a, b) => String(b.__created).localeCompare(String(a.__created)));
    } else if (tab === "past") {
      arr.sort((a, b) => (b.__last || 0) - (a.__last || 0));
    } else {
      arr.sort((a, b) => {
        if (a.__next === null) return 1;
        if (b.__next === null) return -1;
        return a.__next - b.__next;
      });
    }
    return arr;
  };

  const allVisible = tab === "past" ? sortList(past) : sortList(upcoming);
  const listFor = tab === "past" ? past : upcoming;
  // Only upcoming events are listed, capped at the admin "home max" until expanded.
  const pageSettings = useSettings();
  const homeMax = Number(pageSettings.events?.homeMax) || 7;
  const limit = tab === "upcoming" && !showAll ? homeMax : Infinity;
  const visible = allVisible.slice(0, limit);
  const capped = visible.length < allVisible.length;

  /* ── Calendar ── */
  const monthCells = useMemo(() => {
    const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    const startShift = (first.getDay() + 6) % 7; // Monday-first
    const total = new Date(
      calMonth.getFullYear(),
      calMonth.getMonth() + 1,
      0
    ).getDate();
    const byDay = new Map();
    events.forEach((ev) => {
      if (!matchesFilters(ev)) return;
      (ev.__occ || []).forEach((d) => {
        if (
          d.getMonth() === calMonth.getMonth() &&
          d.getFullYear() === calMonth.getFullYear()
        ) {
          const k = dateKey(d);
          if (!byDay.has(k)) byDay.set(k, []);
          byDay.get(k).push(ev);
        }
      });
    });
    const cells = [];
    for (let i = 0; i < startShift; i += 1) cells.push(null);
    for (let d = 1; d <= total; d += 1) {
      const date = new Date(calMonth.getFullYear(), calMonth.getMonth(), d);
      cells.push({ date, key: dateKey(date), events: byDay.get(dateKey(date)) || [] });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return { cells, byDay };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, calMonth, search, activeFilter]);

  const selectedEvents = monthCells.byDay.get(selectedDay) || [];

  const monthLabel = calMonth.toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
  const prevMonth = () =>
    setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const thisMonth = () => {
    const n = new Date();
    setCalMonth(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelectedDay(dateKey(n));
  };

  const heading =
    tab === "calendar"
      ? "What's on this month."
      : tab === "past"
        ? "Recently passed."
        : activeFilter === "All"
          ? "Upcoming & ongoing."
          : `For the ${activeFilter.toLowerCase()}.`;

  return (
    <>
      <PageHero
        bg={heroBg}
        eyebrow="Events & Programmes"
        title="What's on at Masjid As Sunnah."
        sub="From weekly classes and community gatherings to seasonal programmes — find what's happening, browse the calendar, and register your place."
      />

      <main id="page">
        <section className="section">
          <div className="container">
            <div className="mb-8 grid items-end gap-6 md:grid-cols-2">
              <Reveal>
                <span className="eyebrow">
                  {activeFilter === "All"
                    ? "All Programmes"
                    : `${activeFilter}' Programmes`}
                </span>
                <h2 className="section-title">{heading}</h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="section-sub md:pb-2 md:text-right">
                  {loading
                    ? "Loading programmes…"
                    : tab === "calendar"
                      ? "Tap a day to see what's on."
                      : tab === "past"
                        ? `${past.length} programme${past.length === 1 ? "" : "s"} recently held.`
                        : capped
                          ? `Showing ${visible.length} of ${allVisible.length} programmes.`
                          : `${listFor.length} programme${listFor.length === 1 ? "" : "s"} listed.`}
                </p>
              </Reveal>
            </div>

            {/* ── Tabs ── */}
            <Reveal delay={60}>
              <div className="no-print mb-6 flex flex-wrap gap-2 border-b border-line pb-px">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`relative -mb-px px-4 py-3 text-[14px] font-medium transition-colors ${
                      tab === t.id
                        ? "text-primary"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {t.label}
                    {tab === t.id && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* ── Toolbar ── */}
            <Reveal delay={120}>
              <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-line-soft bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-bg px-5 py-3 lg:max-w-xs">
                  <MagnifyingGlass
                    size={17}
                    weight="bold"
                    className="shrink-0 text-muted"
                  />
                  <input
                    type="search"
                    placeholder="Search events…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-muted/80"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCE_FILTERS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-300 ${
                          activeFilter === f
                            ? "border-primary bg-primary text-white"
                            : "border-line bg-surface text-ink-soft hover:border-primary-mist hover:text-primary"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {tab !== "calendar" && (
                    <label className="flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2">
                      <SortAscending
                        size={15}
                        weight="bold"
                        className="text-muted"
                      />
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="cursor-pointer border-0 bg-transparent text-[13px] font-medium text-ink-soft outline-none"
                        aria-label="Sort programmes"
                      >
                        {SORTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>
            </Reveal>

            {/* ── Calendar view ── */}
            {tab === "calendar" && (
              <Reveal delay={80}>
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface">
                    <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
                      <button
                        type="button"
                        onClick={prevMonth}
                        aria-label="Previous month"
                        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-primary-mist hover:text-primary"
                      >
                        <CaretLeft size={16} weight="bold" />
                      </button>
                      <span className="font-heading text-[15.5px] font-semibold text-ink">
                        {monthLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={thisMonth}
                          className="rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-primary-deep"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={nextMonth}
                          aria-label="Next month"
                          className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-primary-mist hover:text-primary"
                        >
                          <CaretRight size={16} weight="bold" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-line-soft bg-bg/70">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                          <div
                            key={d}
                            className="px-2 py-3 text-center text-[10.5px] font-semibold tracking-[0.14em] text-muted uppercase"
                          >
                            {d}
                          </div>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-7">
                      {monthCells.cells.map((cell, i) => {
                        if (!cell)
                          return (
                            <div
                              key={`x${i}`}
                              className="min-h-[92px] border-r border-b border-line-soft bg-bg/40 last:border-r-0"
                            />
                            );
                        const isToday =
                          cell.key === dateKey(new Date());
                        const isSelected = cell.key === selectedDay;
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            onClick={() => setSelectedDay(cell.key)}
                            className={`min-h-[92px] border-r border-b border-line-soft p-2 text-left transition-colors last:border-r-0 ${
                              isSelected
                                ? "bg-primary-mist/50"
                                : "hover:bg-bg"
                            }`}
                          >
                            <span
                              className={`inline-grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold ${
                                isToday
                                  ? "bg-primary text-white"
                                  : "text-ink-soft"
                              }`}
                            >
                              {cell.date.getDate()}
                            </span>
                            <span className="mt-1 flex flex-wrap gap-1">
                              {cell.events.slice(0, 3).map((ev) => (
                                <i
                                  key={ev.id}
                                  title={ev.title}
                                  className={`h-1.5 w-1.5 rounded-full ${dotFor(
                                    ev.audience
                                  )}`}
                                />
                              ))}
                              {cell.events.length > 3 && (
                                <i className="text-[10px] leading-none text-muted not-italic">
                                  +{cell.events.length - 3}
                                </i>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected day */}
                  <div className="rounded-2xl border border-line-soft bg-surface p-6">
                    <span className="eyebrow">
                      <Clock size={13} weight="bold" className="mr-1.5" />
                      Selected day
                    </span>
                    <p className="font-display text-[26px] leading-tight font-bold text-ink">
                      {new Date(`${selectedDay}T12:00:00`).toLocaleDateString(
                        "en-AU",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        }
                      )}
                    </p>

                    {selectedEvents.length === 0 ? (
                      <p className="mt-5 text-[14.5px] leading-relaxed text-muted">
                        Nothing scheduled on this day. Tap another day with a
                        dot to see its programmes.
                      </p>
                    ) : (
                      <ul className="mt-5 flex flex-col gap-3">
                        {selectedEvents.map((ev) => (
                          <li key={ev.id}>
                            <Link
                              to={`/events/${ev.slug}`}
                              className="group flex items-start gap-3 rounded-xl border border-line-soft bg-bg p-4 transition-all duration-300 hover:border-primary-mist hover:bg-surface"
                            >
                              <i
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotFor(
                                  ev.audience
                                )}`}
                              />
                              <span className="min-w-0">
                                <span className="block font-heading text-[15px] font-semibold text-ink transition-colors group-hover:text-primary">
                                  {ev.title}
                                </span>
                                <span className="mt-0.5 block text-[13px] text-muted">
                                  {getDisplayDate(ev)}
                                  {ev.location ? ` · ${ev.location}` : ""}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            )}

            {/* ── Grid ── */}
            {tab !== "calendar" &&
              (loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse overflow-hidden rounded-2xl border border-line-soft bg-surface"
                    >
                      <div className="h-52 bg-bg-slab" />
                      <div className="space-y-3 p-6">
                        <div className="h-5 w-3/4 rounded bg-bg-slab" />
                        <div className="h-4 w-full rounded bg-bg-slab" />
                        <div className="h-4 w-1/2 rounded bg-bg-slab" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <Reveal
                  delay={100}
                  className="mx-auto max-w-lg rounded-2xl border border-dashed border-line bg-surface px-8 py-14 text-center"
                >
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-mist text-primary">
                    {tab === "past" ? (
                      <CalendarCheck size={32} weight="duotone" />
                    ) : (
                      <CalendarX size={32} weight="duotone" />
                    )}
                  </span>
                  <h3 className="mt-6 font-heading text-xl font-semibold">
                    {tab === "past"
                      ? "No past events yet"
                      : "No events found"}
                  </h3>
                  <p className="mt-2 text-[15px] text-muted">
                    {search || activeFilter !== "All"
                      ? "Try adjusting your search or filters."
                      : tab === "past"
                        ? "Programmes you've attended will be listed here."
                        : "New events will be announced soon. Follow our social media for the latest updates."}
                  </p>
                  {search || activeFilter !== "All" ? (
                    <button
                      type="button"
                      className="btn btn-secondary mt-6"
                      onClick={() => {
                        setSearch("");
                        setFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  ) : null}
                </Reveal>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visible.map((ev, i) => {
                    const badge = getBadge(ev.audience);
                    return (
                    <Reveal
                      key={ev.id}
                      delay={(i % 3) * 90}
                      tilt
                      className="group relative flex flex-col overflow-hidden rounded-2xl keep-radius border border-line-soft bg-surface hover:-translate-y-1.5 hover:shadow-lg"
                    >
                      <div className="relative h-52 overflow-hidden bg-bg-slab">
                        {(ev.full_image || ev.cover_image || ev.image_url) && (
                          <img
                            src={ev.full_image || ev.cover_image || ev.image_url}
                            alt={ev.title}
                            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                              ev.__past ? "grayscale-[0.65]" : ""
                            }`}
                            loading="lazy"
                          />
                        )}
                        <span
                          className={`absolute top-4 left-4 rounded-full px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        {ev.__past && (
                          <span className="absolute top-4 right-4 rounded-full bg-gold px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-primary-deep uppercase">
                            Ended
                          </span>
                        )}
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
                          {!isFreeCost(ev.cost) && (
                            <span className="flex items-center gap-2">
                              <CurrencyDollar
                                size={14}
                                weight="duotone"
                                className="text-gold-deep"
                              />
                              {ev.cost}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-6">
                          <Link
                            to={`/events/${ev.slug}`}
                            className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-deep px-4 py-3 font-heading text-[13px] font-medium text-white transition-all duration-300 group-hover:bg-primary"
                          >
                            {ev.__past ? "View recap" : "View Details"}
                            <ArrowRight size={13} weight="bold" />
                          </Link>
                          {!ev.__past && hasRegisterOption(ev) &&
                            (ev.form_id ? (
                              <Link
                                to={`/events/${ev.slug}/register`}
                                className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full border border-primary/50 px-4 py-3 font-heading text-[13px] font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white"
                              >
                                Register
                              </Link>
                            ) : (
                              <a
                                href={ev.register_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full border border-primary/50 px-4 py-3 font-heading text-[13px] font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white"
                              >
                                Register
                              </a>
                            ))}
                        </div>
                      </div>

                      {/* Whole card is tappable — the buttons above stay visible. */}
                      <Link
                        to={`/events/${ev.slug}`}
                        className="absolute inset-0 z-0"
                        aria-label={`View ${ev.title}`}
                      />
                    </Reveal>
                    );
                  })}
                </div>
              ))}

            {capped && (
              <Reveal delay={60} className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="btn btn-secondary"
                >
                  Show all {allVisible.length} events
                </button>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
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
                Stay in the loop
                <i className="h-px w-8 bg-gold/70" />
              </span>
              <h2 className="font-display text-[clamp(32px,4.5vw,52px)] leading-[1.06] font-bold tracking-[-0.02em] text-white">
                Never miss a gathering.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/60">
                Upcoming programmes, events and reflections — no clutter, just
                the community's calendar.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/contact" className="btn btn-gold">
                  Get in touch
                </Link>
                <Link
                  to="/prayer"
                  className="btn border border-white/25 bg-transparent text-white hover:border-gold hover:text-gold"
                >
                  Prayer times
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
