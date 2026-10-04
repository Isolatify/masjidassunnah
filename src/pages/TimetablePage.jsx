import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  DownloadSimple,
  FileCsv,
  Code,
  Printer,
  ClipboardText,
  CalendarPlus,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { SITE, PRAYER_WIDGET_URL } from "../config";
import {
  PRAYER_META,
  fetchRange,
  navDateKey,
} from "../lib/prayerTimes";
import heroBg from "../assets/photos/screen-prayer-times.jpg";

const ROWS = [
  ...PRAYER_META.map((p) => ({ key: p.key, name: p.name, arabic: p.arabic })),
  { key: "jumuah", name: "Jumu'ah", arabic: "الجمعة", fridayOnly: true },
];

const MODES = [
  { id: "both", label: "Both" },
  { id: "athan", label: "Athan" },
  { id: "iqamah", label: "Iqamah" },
];

function startOfWeek(date) {
  const d = new Date(date);
  const shift = (d.getDay() + 6) % 7; // Monday-first
  d.setDate(d.getDate() - shift);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeTo24(str) {
  if (!str || str === "--") return null;
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}${min}`;
}

function saveFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function isoDate(d) {
  return d.toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
}

export default function TimetablePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [mode, setMode] = useState("both");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const weekStart = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const today = new Date();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchRange(isoDate(weekStart), 7).then((res) => {
      if (!active) return;
      setEntries(res || []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [weekStart]);

  const entryFor = useCallback(
    (date) => {
      const key = navDateKey(date);
      return (
        entries.find((e) => e.dateKey === key) ||
        entries.find((e) => e.weekday === date.getDay()) ||
        null
      );
    },
    [entries]
  );

  const weekLabel = `${weekStart.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  })} – ${addDays(weekStart, 6).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  const isCurrentWeek = weekOffset === 0;

  /* ----- Data shaping for exports ----- */
  const rows = useMemo(() => {
    return ROWS.map((row) => ({
      ...row,
      cells: days.map((d) => {
        const entry = entryFor(d);
        const p = entry?.prayers?.find((x) => x.key === row.key);
        return { date: d, athan: p?.athan || "–", iqamah: p?.iqamah || "–" };
      }),
    }));
  }, [days, entryFor]);

  const buildCSV = useCallback(() => {
    const head = ["Date", "Weekday", "Prayer", "Athan", "Iqamah"];
    const lines = [head.join(",")];
    days.forEach((d, i) => {
      rows.forEach((r) => {
        const cell = r.cells[i];
        if (cell.athan === "–" && cell.iqamah === "–") return;
        lines.push(
          [
            isoDate(d),
            d.toLocaleDateString("en-AU", { weekday: "long" }),
            `"${r.name}"`,
            cell.athan,
            cell.iqamah,
          ].join(",")
        );
      });
    });
    return lines.join("\n");
  }, [days, rows]);

  const buildJSON = useCallback(() => {
    return JSON.stringify(
      {
        masjid: SITE.name,
        address: SITE.address,
        week: weekLabel,
        source: PRAYER_WIDGET_URL,
        days: days.map((d, i) => ({
          date: isoDate(d),
          weekday: d.toLocaleDateString("en-AU", { weekday: "long" }),
          prayers: rows
            .map((r) => ({
              key: r.key,
              name: r.name,
              athan: r.cells[i].athan,
              iqamah: r.cells[i].iqamah,
            }))
            .filter((p) => p.athan !== "–" || p.iqamah !== "–"),
        })),
      },
      null,
      2
    );
  }, [days, rows, weekLabel]);

  const buildICS = useCallback(() => {
    const stamp = () => new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtstamp = stamp();
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Masjid As Sunnah//Weekly Timetable//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];
    days.forEach((d, i) => {
      rows.forEach((r) => {
        const t = timeTo24(r.cells[i].athan);
        if (!t) return;
        const dateKey = d
          .toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" })
          .replace(/-/g, "");
        lines.push(
          "BEGIN:VEVENT",
          `UID:${dateKey}-${r.key}-athan@masjidassunnah.com.au`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART:${dateKey}T${t}00`,
          `SUMMARY:${r.name} – Athan`,
          `LOCATION:${SITE.name}\\, ${SITE.address}`,
          "DESCRIPTION:Athan at Masjid As Sunnah, Lakemba.",
          "DURATION:PT15M",
          "END:VEVENT"
        );
        const iq = timeTo24(r.cells[i].iqamah);
        if (iq && iq !== t) {
          lines.push(
            "BEGIN:VEVENT",
            `UID:${dateKey}-${r.key}-iqamah@masjidassunnah.com.au`,
            `DTSTAMP:${dtstamp}`,
            `DTSTART:${dateKey}T${iq}00`,
            `SUMMARY:${r.name} – Iqamah`,
            `LOCATION:${SITE.name}\\, ${SITE.address}`,
            "DESCRIPTION:Iqamah at Masjid As Sunnah, Lakemba.",
            "DURATION:PT20M",
            "END:VEVENT"
          );
        }
      });
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }, [days, rows]);

  const buildText = useCallback(() => {
    const out = [`${SITE.name} – Weekly Timetable (${weekLabel})`, ""];
    days.forEach((d, i) => {
      out.push(d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }));
      rows.forEach((r) => {
        const c = r.cells[i];
        if (c.athan === "–" && c.iqamah === "–") return;
        out.push(`  ${r.name.padEnd(9)} Athan ${c.athan}   Iqamah ${c.iqamah}`);
      });
      out.push("");
    });
    return out.join("\n");
  }, [days, rows, weekLabel]);

  const slug = `masjid-as-sunnah-timetable-${isoDate(weekStart)}`;

  const actions = [
    { id: "csv", label: "CSV", icon: FileCsv, fn: () => saveFile(`${slug}.csv`, buildCSV(), "text/csv;charset=utf-8") },
    { id: "json", label: "JSON", icon: Code, fn: () => saveFile(`${slug}.json`, buildJSON(), "application/json") },
    { id: "ics", label: "Calendar", icon: CalendarPlus, fn: () => saveFile(`${slug}.ics`, buildICS(), "text/calendar;charset=utf-8") },
    { id: "print", label: "Print / PDF", icon: Printer, fn: () => window.print() },
    {
      id: "copy",
      label: copied ? "Copied" : "Copy",
      icon: ClipboardText,
      fn: async () => {
        try {
          await navigator.clipboard.writeText(buildText());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable */
        }
      },
    },
  ];

  return (
    <>
      <PageHero
        bg={heroBg}
        eyebrow="Weekly Timetable"
        title="The whole week, at a glance."
        sub="Every Athan and Iqamah for the week – browse, switch days, then download the timetable in the format that suits you."
      />

      <main id="page">
        <section className="section">
          <div className="container">
            {/* ----- Controls ----- */}
            <Reveal>
              <div className="no-print mb-8 flex flex-col gap-4 rounded-2xl border border-line-soft bg-surface p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 rounded-full border border-line bg-bg px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w - 1)}
                    aria-label="Previous week"
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-primary-mist hover:text-primary"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </button>
                  <span className="px-2 font-heading text-[13.5px] font-semibold tracking-[0.03em] text-ink uppercase">
                    {weekLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w + 1)}
                    aria-label="Next week"
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-primary-mist hover:text-primary"
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                  {!isCurrentWeek && (
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className="mr-1 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-primary-deep"
                    >
                      This week
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-line bg-bg p-1">
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        className={`rounded-full px-4 py-2 text-[12.5px] font-medium transition-all duration-300 ${
                          mode === m.id
                            ? "bg-primary text-white shadow-sm"
                            : "text-ink-soft hover:text-primary"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <a
                    href={PRAYER_WIDGET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-primary transition-colors hover:text-primary-deep"
                  >
                    MasjidBox
                    <ArrowSquareOut size={13} weight="bold" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* ----- Table ----- */}
            <Reveal delay={80}>
              <div className="overflow-x-auto rounded-2xl border border-line-soft bg-surface shadow-sm">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line-soft bg-bg">
                      <th className="px-5 py-4 text-[10.5px] font-semibold tracking-[0.2em] text-muted uppercase">
                        Prayer
                      </th>
                      {days.map((d) => {
                        const isToday = isSameDay(d, today);
                        return (
                          <th
                            key={d.toISOString()}
                            className={`px-4 py-4 text-center ${
                              isToday ? "bg-primary-mist/60" : ""
                            }`}
                          >
                            <span
                              className={`block text-[10.5px] font-semibold tracking-[0.16em] uppercase ${
                                isToday ? "text-primary" : "text-muted"
                              }`}
                            >
                              {d.toLocaleDateString("en-AU", { weekday: "short" })}
                            </span>
                            <span
                              className={`mt-1 block font-display text-[19px] font-bold ${
                                isToday ? "text-primary" : "text-ink"
                              }`}
                            >
                              {d.getDate()}
                            </span>
                            {isToday && (
                              <span className="mt-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] text-white uppercase">
                                Today
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i} className="border-b border-line-soft">
                            <td className="px-5 py-4">
                              <div className="h-4 w-20 animate-pulse rounded bg-bg-slab" />
                            </td>
                            {days.map((d) => (
                              <td key={d.toISOString()} className="px-4 py-4">
                                <div className="mx-auto h-4 w-14 animate-pulse rounded bg-bg-slab" />
                              </td>
                            ))}
                          </tr>
                        ))
                      : rows.map((r) => (
                          <tr
                            key={r.key}
                            className="border-b border-line-soft last:border-0 transition-colors hover:bg-bg/70"
                          >
                            <td className="px-5 py-4">
                              <span className="font-heading text-[15px] font-semibold text-ink">
                                {r.name}
                              </span>
                              <span className="ml-2 font-arabic text-[13px] text-muted">
                                {r.arabic}
                              </span>
                            </td>
                            {r.cells.map((c) => {
                              const isToday = isSameDay(c.date, today);
                              const empty = c.athan === "–" && c.iqamah === "–";
                              return (
                                <td
                                  key={c.date.toISOString()}
                                  className={`px-4 py-4 text-center align-middle ${
                                    isToday ? "bg-primary-mist/40" : ""
                                  }`}
                                >
                                  {empty ? (
                                    <span className="text-[14px] text-muted/60">–</span>
                                  ) : (
                                    <span className="inline-flex flex-col items-center gap-0.5">
                                      {(mode === "both" || mode === "athan") && (
                                        <span className="font-heading text-[14.5px] tabular-nums text-ink-soft">
                                          {c.athan}
                                        </span>
                                      )}
                                      {(mode === "both" || mode === "iqamah") && (
                                        <span
                                          className={`font-heading text-[14.5px] font-semibold tabular-nums ${
                                            mode === "both"
                                              ? "text-primary"
                                              : "text-ink"
                                          }`}
                                        >
                                          {c.iqamah}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            <p className="no-print mt-4 text-[13px] text-muted">
              Times are shown in Athan / Iqamah pairs for Masjid As Sunnah,
              Lakemba. On Fridays the Jumu'ah row replaces Dhuhr.
            </p>

            {/* ----- Download ----- */}
            <Reveal delay={140}>
              <div className="no-print mt-10 rounded-2xl border border-line-soft bg-surface p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <span className="eyebrow">Take it with you</span>
                    <h2 className="font-display text-[clamp(24px,3vw,34px)] leading-tight font-bold tracking-[-0.02em]">
                      Download this week's timetable
                    </h2>
                    <p className="mt-2 text-[14.5px] text-muted">
                      Choose a format – it downloads straight to your device.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-mist px-4 py-2 text-[12px] font-semibold tracking-[0.1em] text-primary uppercase">
                    <CalendarBlank size={14} weight="duotone" />
                    {weekLabel}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {actions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={a.fn}
                      className="group inline-flex items-center gap-2 rounded-full border border-line bg-bg px-5 py-3 text-[13.5px] font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                    >
                      <a.icon size={16} weight="duotone" className="text-primary" />
                      {a.label}
                      {a.id !== "copy" && a.id !== "print" && (
                        <DownloadSimple
                          size={13}
                          weight="bold"
                          className="text-muted transition-colors group-hover:text-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}

