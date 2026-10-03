const API_URL = "https://api.masjidbox.com/1.0/masjidbox/landing/athany/masjidassunnah";
const API_KEY = "JejYcMS7hsOsZTPDk2ZhKOAlW9IyQ6Px";

export const PRAYER_META = [
  { key: "fajr", name: "Fajr", arabic: "الفجر" },
  { key: "sunrise", name: "Shuruq", arabic: "الشروق" },
  { key: "dhuhr", name: "Dhuhr", arabic: "الظهر" },
  { key: "asr", name: "Asr", arabic: "العصر" },
  { key: "maghrib", name: "Maghrib", arabic: "المغرب" },
  { key: "isha", name: "Isha", arabic: "العشاء" },
];

function fmtTime(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Sydney",
  });
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildEntry(entry) {
  if (!entry || !entry.date) return null;
  const dateKey = String(entry.date).slice(0, 10);
  const d = new Date(entry.date);
  const isFriday = !isNaN(d.getTime()) && d.getDay() === 5;
  const jumuahAthan = isFriday && entry.jumuah?.[0] ? entry.jumuah[0] : null;
  const jumuahIqamah =
    isFriday && entry.iqamah?.jumuah?.[0] ? entry.iqamah.jumuah[0] : jumuahAthan;

  const prayers = PRAYER_META.map((p) => {
    if (p.key === "dhuhr" && jumuahAthan) {
      return {
        key: "jumuah",
        name: "Jumuah",
        arabic: "الجمعة",
        athan: fmtTime(jumuahAthan),
        iqamah: jumuahIqamah ? fmtTime(jumuahIqamah) : "--",
      };
    }
    return {
      key: p.key,
      name: p.name,
      arabic: p.arabic,
      athan: fmtTime(entry[p.key]),
      iqamah: entry.iqamah?.[p.key] ? fmtTime(entry.iqamah[p.key]) : "--",
    };
  });

  return {
    dateKey,
    weekday: isNaN(d.getTime()) ? -1 : d.getDay(),
    prayers,
  };
}

function todaySydneyKey() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Australia/Sydney",
  });
}

export function navDateKey(date) {
  return date.toLocaleDateString("en-CA", {
    timeZone: "Australia/Sydney",
  });
}

let cache = null;
let cacheKey = null;

async function fetchWindow(begin, days = 7) {
  const params = new URLSearchParams({ get: "at", days: String(days) });
  if (begin) params.set("begin", begin);
  const res = await fetch(`${API_URL}?${params}`, {
    headers: { apikey: API_KEY },
  });
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  return (data.timetable || []).map(buildEntry).filter(Boolean);
}

const rangeCache = new Map();

export async function fetchRange(beginISO, days = 7) {
  const key = `${beginISO}:${days}:${todaySydneyKey()}`;
  if (rangeCache.has(key)) return rangeCache.get(key);
  try {
    const entries = await fetchWindow(beginISO, days);
    rangeCache.set(key, entries);
    return entries;
  } catch {
    return null;
  }
}

export async function fetchWeek(force = false) {
  const key = todaySydneyKey();
  if (!force && cache && cacheKey === key) return cache;

  try {
    const today = new Date();
    const pastBegin = new Date(today);
    pastBegin.setDate(pastBegin.getDate() - 6);
    const pastKey = navDateKey(pastBegin);

    const [past, future] = await Promise.all([
      fetchWindow(pastKey),
      fetchWindow(null),
    ]);

    const seen = new Set();
    const week = [...past, ...future].filter((e) => {
      if (seen.has(e.dateKey)) return false;
      seen.add(e.dateKey);
      return true;
    });

    cache = week;
    cacheKey = key;
    return week;
  } catch {
    if (cache) return cache;
    return null;
  }
}

export function getDayPrayers(week, date) {
  if (!week || !week.length) return null;
  const key = navDateKey(date);
  const exact = week.find((e) => e.dateKey === key);
  if (exact) return exact.prayers;
  const wd = date.getDay();
  const byWd = week.find((e) => e.weekday === wd);
  return byWd ? byWd.prayers : week[week.length - 1].prayers;
}

export function parseTimeToMins(str) {
  if (!str || str === "--") return -1;
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return -1;
  let h = parseInt(m[1], 10);
  const mins = parseInt(m[2], 10);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + mins;
}

function parseTimeComponents(timeStr) {
  if (!timeStr || timeStr === "--") return null;
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mins = parseInt(m[2], 10);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return { h, m: mins };
}

function timeToDate(date, timeStr) {
  const tc = parseTimeComponents(timeStr);
  if (!tc) return null;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    tc.h,
    tc.m,
    0,
    0
  );
}

export function getDiffParts(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    hours: pad(h),
    minutes: pad(m),
    seconds: pad(s),
  };
}

export function getCountdownParts(targetDate, timeStr, now) {
  const target = timeToDate(targetDate, timeStr);
  if (!target) return null;
  const diff = target - now;
  if (diff <= 0) return null;
  return getDiffParts(diff);
}

export function getElapsedParts(targetDate, timeStr, now) {
  const target = timeToDate(targetDate, timeStr);
  if (!target) return null;
  return getDiffParts(Math.max(0, now - target));
}

export function getNextPrayer(prayers, now, nextPrayers) {
  if (!prayers) return null;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const byKey = Object.fromEntries(prayers.map((p) => [p.key, p]));
  const ordered = prayers.filter(
    (p) => p.key !== "sunrise" && parseTimeToMins(p.iqamah) >= 0
  );

  for (const p of ordered) {
    const iqM = parseTimeToMins(p.iqamah);
    if (nowMins < iqM) {
      const athanM = parseTimeToMins(p.athan);
      if (nowMins < athanM) {
        return {
          prayer: p,
          phase: "athan",
          targetTime: p.athan,
          showIqamah: true,
        };
      }
      return {
        prayer: p,
        phase: "iqamah",
        targetTime: p.iqamah,
        showIqamah: false,
      };
    }
  }

  const nextByKey = Object.fromEntries(
    (nextPrayers || []).map((p) => [p.key, p])
  );
  const fajr = nextByKey["fajr"] || byKey["fajr"];
  return {
    prayer: fajr,
    phase: "athan",
    targetTime: fajr?.athan,
    showIqamah: true,
    nextDay: true,
  };
}

export function getNavLabel(navDate) {
  const today = new Date();
  const tY = today.getFullYear();
  const tM = today.getMonth();
  const tD = today.getDate();
  const nY = navDate.getFullYear();
  const nM = navDate.getMonth();
  const nD = navDate.getDate();
  if (tY === nY && tM === nM && tD === nD) return "Today";
  return navDate.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function getDaysFromToday(navDate) {
  const today = new Date();
  const startNav = new Date(
    navDate.getFullYear(),
    navDate.getMonth(),
    navDate.getDate()
  );
  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((startNav - startToday) / 86400000);
}

export function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function getNextFridayFormatted(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getLastFridayOfMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  let friday = new Date(lastDay);
  while (friday.getDay() !== 5) {
    friday.setDate(friday.getDate() - 1);
  }
  return friday.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
