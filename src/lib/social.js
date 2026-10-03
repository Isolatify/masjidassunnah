import { SOCIALS } from "../config";

const API_KEY = "AIzaSyBE1SmFBB0ar8QJ1JHi_deRVbozCLyT9BQ";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const THUMB = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const TTL_MS = 10 * 60 * 1000;

const VIDEO_SEED = [
  {
    id: "gNYDqKd3Ul4",
    title: "Timeless Wisdom - Lessons from Luqman For All Believers | Sheikh Bahdon Robleh",
    href: "https://www.youtube.com/watch?v=gNYDqKd3Ul4",
    thumb: THUMB("gNYDqKd3Ul4"),
  },
  {
    id: "P_cgQoPXgQ8",
    title: "Live Friday Khutbah | Abu Bakr Zoud | The Great Sacrifice",
    href: "https://www.youtube.com/watch?v=P_cgQoPXgQ8",
    thumb: THUMB("P_cgQoPXgQ8"),
  },
  {
    id: "6f_0zNPNIvw",
    title: "Live Friday Khutbah | Sh Tahar Mechraoui | The Purpose Of Worship",
    href: "https://www.youtube.com/watch?v=6f_0zNPNIvw",
    thumb: THUMB("6f_0zNPNIvw"),
  },
];

const memory = new Map();

function readCache(key) {
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  return null;
}

function writeCache(key, value) {
  memory.set(key, { at: Date.now(), value });
  return value;
}

function decodeEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function toItem(item) {
  const id = item.id?.videoId;
  if (!id) return null;
  const sn = item.snippet || {};
  const thumbs = sn.thumbnails || {};
  const best = thumbs.medium || thumbs.high || thumbs.default;
  const title = decodeEntities(sn.title || "");
  return {
    id,
    title,
    href: `https://www.youtube.com/watch?v=${id}`,
    thumb: best?.url || THUMB(id),
    published: sn.publishedAt || "",
    channel: sn.channelTitle || "",
    live:
      sn.liveBroadcastContent === "live" || /live|khutbah/i.test(title)
        ? "Live"
        : "",
  };
}

async function searchVideos(params, cacheKey) {
  const cached = cacheKey ? readCache(cacheKey) : null;
  if (cached) return cached;

  const query = new URLSearchParams({
    part: "snippet",
    channelId: SOCIALS.youtube.channelId,
    type: "video",
    maxResults: String(params.maxResults || 12),
    order: params.order || "date",
    key: API_KEY,
    ...params.extra,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${SEARCH_URL}?${query}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`youtube ${res.status}`);
    const data = await res.json();
    const items = (data.items || []).map(toItem).filter(Boolean);
    return cacheKey ? writeCache(cacheKey, items) : items;
  } finally {
    clearTimeout(timer);
  }
}

async function getRecentVideos() {
  try {
    const items = await searchVideos(
      { order: "date", maxResults: 12 },
      "recent"
    );
    return items.length ? items : VIDEO_SEED;
  } catch {
    return VIDEO_SEED;
  }
}

export async function getLatestVideos(limit = 3) {
  const videos = await getRecentVideos();
  return videos.slice(0, limit);
}

export async function getLatestLivestream() {
  // 1. An actual live broadcast, right now.
  try {
    const live = await searchVideos(
      {
        order: "date",
        maxResults: 1,
        extra: { eventType: "live" },
      },
      "live"
    );
    if (live.length) return live[0];
  } catch {
    /* fall through to the most recent upload */
  }

  // 2. Otherwise the newest broadcast / khutbah upload.
  const videos = await getRecentVideos();
  if (!videos.length) return null;
  return (
    videos.find((v) => /live|khutbah/i.test(v.title)) || videos[0]
  );
}
