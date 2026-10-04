import { useEffect, useState } from "react";
import { fetchJumuah } from "./prayerTimes";

export const JUMUAH_FALLBACK = "12:15 PM";

/**
 * Jumu'ah khutbah time from the Masjidbox timetable.
 * Returns `{ athan, iqamah, dateKey, isFallback }` — falls back to the
 * published time until (or if) the API is unreachable, so layout never jumps.
 */
export default function useJumuah() {
  const [jumuah, setJumuah] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchJumuah().then((res) => {
      if (alive && res) setJumuah(res);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!jumuah) {
    return {
      athan: JUMUAH_FALLBACK,
      iqamah: JUMUAH_FALLBACK,
      dateKey: null,
      isFallback: true,
    };
  }
  return { ...jumuah, isFallback: false };
}
