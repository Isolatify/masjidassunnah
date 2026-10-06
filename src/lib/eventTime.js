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
