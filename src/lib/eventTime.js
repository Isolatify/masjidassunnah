import { getDayPrayers, parseTimeToMins } from "./prayerTimes.js";

export const AFTER_PRAYER_KEYS = {
  "After Fajr": "fajr",
  "After Dhuhr": "dhuhr",
  "After Asr": "asr",
  "After Maghrib": "maghrib",
  "After Isha": "isha",
};

/**
 * When does this date entry actually start? Returns a Date, or null when no
 * clock time is known (all-day, bare date, or prayer timetable unavailable).
 * "After Maghrib" etc. is resolved against the masjid's timetable — NOT a
 * guessed time of day.
 */
export function eventStartTarget(entry, prayerWeek) {
  if (!entry?.date_start) return null;
  const day = new Date(`${entry.date_start}T00:00:00`);
  if (isNaN(day.getTime())) return null;
  const at = (h, m) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);

  // Explicit clock time, e.g. "18:30" from the admin date editor.
  if (entry.time_start && /^\d{1,2}:\d{2}$/.test(entry.time_start)) {
    const [h, m] = entry.time_start.split(":").map(Number);
    return at(h, m);
  }

  // "After Maghrib" etc. — use the real athan time for that date.
  if (entry.after_prayer) {
    const key = AFTER_PRAYER_KEYS[entry.after_prayer];
    const prayers = getDayPrayers(prayerWeek, day);
    const p = key && prayers?.find((x) => x.key === key);
    const mins = p ? parseTimeToMins(p.athan) : -1;
    if (mins >= 0) return at(Math.floor(mins / 60), mins % 60);
  }
  return null;
}

/**
 * Human phrase for the countdown badge ("Today", "3 hours", "2 days"),
 * or null when the date has already passed.
 *
 * Counts to the event's REAL start time — never to a guessed time of day.
 */
export function untilPhraseFor(entry, prayerWeek, now = new Date()) {
  if (!entry?.date_start) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDay = new Date(`${entry.date_start}T00:00:00`);
  if (isNaN(entryDay.getTime())) return null;

  // The date has already passed — no countdown.
  if (entryDay.getTime() < startOfToday.getTime()) return null;

  const target = eventStartTarget(entry, prayerWeek);

  // Under way (or start time already passed today).
  if (target && target.getTime() <= now.getTime()) return "Today";

  // Today but no known clock time (all-day / timetable unavailable).
  if (!target && entryDay.getTime() === startOfToday.getTime()) return "Today";

  // Future date without a clock time → whole days away.
  if (!target) {
    const days = Math.round(
      (entryDay.getTime() - startOfToday.getTime()) / 86400000
    );
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  const sec = Math.floor((target.getTime() - now.getTime()) / 1000);
  const units = [
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
    [1, "second"],
  ];
  for (const [size, name] of units) {
    if (sec >= size) {
      const n = Math.floor(sec / size);
      return `${n} ${name}${n === 1 ? "" : "s"}`;
    }
  }
  return "Moments";
}

/* ── Occurrence expansion: date ranges + recurring patterns ────────── */

const WEEKDAY_TO_IDX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const RECUR_BACK_DAYS = 366;
const RECUR_FWD_DAYS = 366;
const MAX_RANGE_DAYS = 62;
const MAX_RECURRING_DAYS = 400;

function parseDay(str) {
  if (!str) return null;
  const d = new Date(`${str}T12:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function ymd(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function isRecurringEntry(entry) {
  return !!entry && (entry.date_type === "recurring" || !!entry.recurring_pattern);
}

/* Human label for an entry's recurrence ("Every Saturday", "Daily", …). */
export function recurringLabel(entry) {
  if (!entry) return null;
  const p =
    entry.recurring_pattern ||
    (entry.date_type === "recurring"
      ? entry.weekdays?.length
        ? "custom"
        : "weekly"
      : null);
  if (!p) return null;
  if (p === "daily") return "Daily";
  if (p === "weekly") {
    const d = parseDay(entry.date_start);
    return d
      ? `Every ${d.toLocaleDateString("en-AU", { weekday: "long" })}`
      : "Weekly";
  }
  if (p === "monthly") return "Monthly";
  if (p === "yearly") return "Yearly";
  if (p === "custom")
    return entry.weekdays?.length ? `Every ${entry.weekdays.join(", ")}` : "Weekly";
  return p;
}

/* dates_json, or the event's top-level columns as a single entry. */
export function effectiveEntries(ev) {
  if (!ev) return [];
  const list = (ev.dates_json || []).filter((d) => d?.date_start);
  if (list.length) return list;
  if (ev.date_start)
    return [
      {
        date_start: ev.date_start,
        date_end: ev.date_end || null,
        date_type: ev.date_type || null,
        recurring_pattern: ev.recurring_pattern || null,
        weekdays: null,
      },
    ];
  return [];
}

function expandSpan(entry) {
  const start = parseDay(entry?.date_start);
  if (!start) return [];
  let end = start;
  if (entry.date_end && entry.date_end !== entry.date_start) {
    const e = parseDay(entry.date_end);
    if (e) end = e;
  }
  const out = [];
  let d = new Date(start);
  let guard = 0;
  while (d <= end && guard < MAX_RANGE_DAYS) {
    out.push(new Date(d));
    d = addDays(d, 1);
    guard += 1;
  }
  return out;
}

function expandRecurring(entry, today) {
  const start = parseDay(entry?.date_start);
  if (!start) return [];
  let pattern =
    entry.recurring_pattern ||
    (entry.date_type === "recurring"
      ? entry.weekdays?.length
        ? "custom"
        : "weekly"
      : null);
  if (!pattern) return [];
  // "custom" with no weekday selection behaves as a weekly repeat.
  if (pattern === "custom" && !entry.weekdays?.length) pattern = "weekly";

  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const winStart = addDays(t0, -RECUR_BACK_DAYS);
  const winEnd = addDays(t0, RECUR_FWD_DAYS);
  const from = start.getTime() > winStart.getTime() ? new Date(start) : winStart;
  let to = winEnd;
  const entryEnd = entry.date_end ? parseDay(entry.date_end) : null;
  if (entryEnd && entryEnd.getTime() < to.getTime()) to = entryEnd;
  if (from.getTime() > to.getTime()) return [];

  const out = [];
  const push = (d) => {
    if (
      out.length < MAX_RECURRING_DAYS &&
      d.getTime() >= from.getTime() &&
      d.getTime() <= to.getTime()
    )
      out.push(d);
  };

  if (pattern === "custom" && entry.weekdays?.length) {
    const wanted = new Set(
      entry.weekdays.map((w) => WEEKDAY_TO_IDX[w]).filter((n) => n !== undefined)
    );
    let d = new Date(from);
    let guard = 0;
    const limit = RECUR_BACK_DAYS + RECUR_FWD_DAYS + 2;
    while (d.getTime() <= to.getTime() && guard < limit && out.length < MAX_RECURRING_DAYS) {
      if (wanted.has(d.getDay())) push(new Date(d));
      d = addDays(d, 1);
      guard += 1;
    }
    return out;
  }

  if (pattern === "daily") {
    let d = new Date(from);
    let guard = 0;
    while (d.getTime() <= to.getTime() && out.length < MAX_RECURRING_DAYS && guard < MAX_RECURRING_DAYS) {
      push(new Date(d));
      d = addDays(d, 1);
      guard += 1;
    }
    return out;
  }

  if (pattern === "weekly") {
    // Weekly cadence stays aligned to the original start date.
    const diffDays = Math.round((from.getTime() - start.getTime()) / 86400000);
    const k = Math.max(0, Math.ceil(diffDays / 7));
    let d = addDays(start, 7 * k);
    let guard = 0;
    while (d.getTime() <= to.getTime() && out.length < MAX_RECURRING_DAYS && guard < MAX_RECURRING_DAYS) {
      push(new Date(d));
      d = addDays(d, 7);
      guard += 1;
    }
    return out;
  }

  if (pattern === "monthly") {
    const dom = start.getDate();
    let cursor = new Date(start);
    let guard = 0;
    while (cursor.getTime() <= to.getTime() && guard < 800) {
      if (out.length < MAX_RECURRING_DAYS) push(new Date(cursor));
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const dim = new Date(y, m + 1, 0).getDate();
      cursor = new Date(y, m, Math.min(dom, dim), 12);
      guard += 1;
    }
    return out;
  }

  if (pattern === "yearly") {
    let cursor = new Date(start);
    let guard = 0;
    while (cursor.getTime() <= to.getTime() && guard < 200) {
      if (out.length < MAX_RECURRING_DAYS) push(new Date(cursor));
      const y = cursor.getFullYear() + 1;
      const m = start.getMonth();
      const dim = new Date(y, m + 1, 0).getDate();
      cursor = new Date(y, m, Math.min(start.getDate(), dim), 12);
      guard += 1;
    }
    return out;
  }

  return [];
}

export function entryOccurrences(entry, today = new Date()) {
  return isRecurringEntry(entry)
    ? expandRecurring(entry, today)
    : expandSpan(entry);
}

/* Every calendar day an event is active (ranges expanded, recurring patterns
   projected ±1 year around today, top-level columns as fallback). */
export function eventOccurrences(ev, today = new Date()) {
  const out = [];
  for (const entry of effectiveEntries(ev)) {
    const days = entryOccurrences(entry, today);
    for (const d of days) out.push(d);
  }
  return out;
}

/* The next active day across entries: { idx, dateStr } — dateStr is today
   when the event is in progress, else the next occurrence. null when every
   entry is in the past. */
export function nextEventDate(
  entries,
  todayStr = new Date().toLocaleDateString("en-CA")
) {
  const raw = new Date(`${todayStr}T00:00:00`);
  const now = new Date();
  const t0 = isNaN(raw.getTime())
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
  const today = new Date(t0);
  let best = null;
  (entries || []).forEach((entry, idx) => {
    if (!entry?.date_start) return;
    let dateStr = null;
    if (isRecurringEntry(entry)) {
      const upcoming = expandRecurring(entry, today).filter(
        (d) => d.getTime() >= t0.getTime()
      );
      if (upcoming.length) dateStr = ymd(upcoming[0]);
    } else {
      const s = entry.date_start;
      const end =
        entry.date_end && entry.date_end !== entry.date_start ? entry.date_end : s;
      if (end >= todayStr) dateStr = s <= todayStr ? todayStr : s;
    }
    if (dateStr && (!best || dateStr < best.dateStr)) best = { idx, dateStr };
  });
  return best;
}

/* Convenience: nextEventDate for a whole event row. */
export function eventNextDate(
  ev,
  todayStr = new Date().toLocaleDateString("en-CA")
) {
  return nextEventDate(effectiveEntries(ev), todayStr);
}
