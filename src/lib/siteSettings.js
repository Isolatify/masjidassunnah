// Public settings client for the website.
// Reads the same /api/settings endpoint the admin panel writes to, so
// changes made in Admin → Settings take effect on the live site.

import { useEffect, useState, useSyncExternalStore } from "react";
import { ADMIN_URL } from "./adminUrl";

export const DEFAULTS = {
  site: {
    name: "Masjid As Sunnah",
    tagline: "A house of worship, knowledge and community",
    address: "Sydney, NSW, Australia",
    email: "info@masjidassunnah.com.au",
    phone: "",
    currency: "AUD",
    language: "en",
    timezone: "Australia/Sydney",
    maintenance: false,
  },
  appearance: { theme: "light", accent: "#0f4a36", motion: "full", pattern: "subtle", fontScale: 100 },
  events: { upcomingOnly: true, homeMax: 7, showPast: true },
  signup: { enabled: true, approval: "manual", autoReply: true, confirmation: "" },
  donations: {
    enabled: true,
    showBank: true,
    showCard: true,
    accountName: "Sunnah Foundation Australia",
    bsb: "611 100",
    account: "401328",
    abn: "61 678 328 599",
    stripeKey: "",
    goal: 0,
    minAmount: 5,
  },
  socials: { facebook: "", instagram: "", youtube: "", tiktok: "", telegram: "", whatsapp: "" },
  seo: { title: "Masjid As Sunnah", description: "", robots: "index,follow" },
  advanced: { cacheSeconds: 60, featureForms: true, featureEvents: true, featureDonations: true },
};

let cache = DEFAULTS;
let loaded = false;
let inflight = null;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

function merge(base, extra) {
  if (!extra || typeof extra !== "object") return base;
  const out = { ...base };
  for (const k of Object.keys(extra)) {
    const v = extra[k];
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])
        ? merge(base[k], v)
        : v;
  }
  return out;
}

function applyDocument(s) {
  if (typeof document === "undefined") return;
  const t = document.title;
  const title = s.seo?.title;
  if (title && title !== DEFAULTS.seo.title) document.title = title;
  else if (title && t.startsWith("Masjid As Sunnah")) document.title = title;

  const setMeta = (selector, attr, value) => {
    if (!value) return;
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      const m = selector.match(/\[name="(.+?)"\]|\[property="(.+?)"\]/);
      el.setAttribute(m && m[1] ? "name" : "property", (m && (m[1] || m[2])) || "");
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };
  setMeta('meta[name="description"]', "content", s.seo?.description);
  setMeta('meta[name="robots"]', "content", s.seo?.robots);
  if (s.seo?.ogImage) setMeta('meta[property="og:image"]', "content", s.seo.ogImage);
}

function load() {
  if (loaded) return Promise.resolve(cache);
  if (inflight) return inflight;
  if (!ADMIN_URL) {
    loaded = true;
    return Promise.resolve(cache);
  }
  inflight = fetch(`${ADMIN_URL}/api/settings`, { cache: "no-store" })
    .then((r) => r.json())
    .then((json) => {
      if (json && json.success) {
        cache = merge(DEFAULTS, json.settings);
        applyDocument(cache);
      }
    })
    .catch(() => {})
    .finally(() => {
      loaded = true;
      inflight = null;
      emit();
    });
  return inflight;
}

if (typeof window !== "undefined") {
  load();
  // Re-read when the tab becomes active so admin edits show up on refresh.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load();
  });
}

/** Read a dotted path, e.g. setting("donations.bsb"). */
export function setting(path, fallback) {
  const parts = path.split(".");
  let cur = cache;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return fallback;
    cur = cur[p];
  }
  return cur === undefined ? fallback : cur;
}

export function getSettings() {
  return cache;
}

/** React hook: returns the live settings object (re-renders on update). */
export function useSettings() {
  const subscribe = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };
  const snap = useSyncExternalStore(
    subscribe,
    () => cache,
    () => cache
  );
  const [, force] = useState(0);
  useEffect(() => {
    if (!loaded) load();
  }, []);
  void force;
  return snap;
}

/** Force a re-read (used by tests / after admin save). */
export function reloadSettings() {
  loaded = false;
  return load();
}
