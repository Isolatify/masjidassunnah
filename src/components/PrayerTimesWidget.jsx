import { useState, useEffect } from "react";
import {
  SunDim,
  Sun,
  SunHorizon,
  StarHalf,
  MoonStars,
  UsersThree,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import Reveal from "./Reveal";
import {
  fetchWeek,
  getDayPrayers,
  getNextPrayer,
  getCountdownParts,
  getElapsedParts,
  getDaysFromToday,
  startOfToday,
} from "../lib/prayerTimes";

const ICONS = {
  Fajr: SunDim,
  Shuruq: SunHorizon,
  Dhuhr: Sun,
  Jumuah: UsersThree,
  Asr: StarHalf,
  Maghrib: MoonStars,
  Isha: MoonStars,
};

function addDaysLocal(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function CountdownBlock({ value, unit, gold }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-display text-[clamp(34px,6vw,46px)] leading-none font-bold tabular-nums ${
          gold ? "text-gold" : "text-white"
        }`}
      >
        {value}
      </span>
      <span className="mt-2 text-[10px] font-medium tracking-[0.22em] text-white/45 uppercase">
        {unit}
      </span>
    </div>
  );
}

export default function PrayerTimesWidget() {
  const [week, setWeek] = useState(null);
  const [navDate, setNavDate] = useState(startOfToday());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchWeek().then(setWeek);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!week) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse rounded-3xl border border-white/10 bg-white/5">
        <div className="min-h-[420px]" />
      </div>
    );
  }

  const daysFromToday = getDaysFromToday(navDate);
  const prayers = getDayPrayers(week, navDate) || [];

  let left = null;
  let activeKey = null;

  if (daysFromToday === 0) {
    const nextPrayers = getDayPrayers(week, addDaysLocal(navDate, 1)) || [];
    const state = getNextPrayer(prayers, now, nextPrayers);
    const targetDate = state.nextDay ? addDaysLocal(navDate, 1) : navDate;
    const cd = getCountdownParts(targetDate, state.targetTime, now);
    const sub =
      state.phase === "iqamah"
        ? `until the Iqama at ${state.targetTime}`
        : `until the Athan at ${state.targetTime}`;
    left = {
      prayer: state.prayer,
      cd,
      sub,
      showIqamah: state.showIqamah && !!cd,
      iqamah: state.prayer?.iqamah,
    };
    activeKey = state.prayer.key;
  } else if (daysFromToday > 0) {
    const fajr = prayers.find((p) => p.key === "fajr");
    const cd = getCountdownParts(navDate, fajr.athan, now);
    left = {
      prayer: fajr,
      cd,
      sub: `until the Athan at ${fajr.athan}`,
      showIqamah: !!cd,
      iqamah: fajr.iqamah,
    };
    activeKey = "fajr";
  } else {
    const isha = prayers.find((p) => p.key === "isha");
    const cd = getElapsedParts(navDate, isha.iqamah, now);
    left = {
      prayer: isha,
      cd,
      sub: `since the Iqama at ${isha.iqamah}`,
      showIqamah: false,
      iqamah: null,
    };
    activeKey = "isha";
  }

  const prevDay = () => setNavDate((d) => addDaysLocal(d, -1));
  const nextDay = () => setNavDate((d) => addDaysLocal(d, 1));
  const goToday = () => setNavDate(startOfToday());
  const isToday = daysFromToday === 0;

  return (
    <Reveal className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] md:grid md:grid-cols-[minmax(0,340px)_1fr]">
      {/* ── Next prayer panel ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-deep p-8 text-white md:p-9">
        <div className="text-[11px] font-medium tracking-[0.26em] text-gold uppercase">
          {left.cd ? "Next Prayer" : "Today"}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <span className="font-display text-4xl font-bold md:text-[40px]">
            {left.prayer.name}
          </span>
          <span className="font-arabic text-2xl text-white/60">
            {left.prayer.arabic}
          </span>
        </div>

        {left.cd ? (
          <>
            <div className="mt-7 flex items-start justify-between gap-2">
              <CountdownBlock value={left.cd.hours} unit="hrs" />
              <span className="mt-2 text-3xl text-white/20">:</span>
              <CountdownBlock value={left.cd.minutes} unit="mins" />
              <span className="mt-2 text-3xl text-white/20">:</span>
              <CountdownBlock value={left.cd.seconds} unit="secs" gold />
            </div>
            <p className="mt-6 text-[14px] text-white/60">{left.sub}</p>
            {left.showIqamah && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
                Iqamah <strong className="text-white">{left.iqamah}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="mt-6 text-[14px] text-white/60">
            Check prayer times for today
          </p>
        )}
      </div>

      {/* ── Times table ── */}
      <div className="bg-surface p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-1 rounded-full border border-line bg-bg px-2 py-1.5">
          <button
            type="button"
            onClick={prevDay}
            aria-label="Previous day"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-primary-mist hover:text-primary"
          >
            <CaretLeft size={16} weight="bold" />
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-heading text-[13.5px] font-semibold tracking-[0.04em] text-ink uppercase">
              {navDate.toLocaleDateString("en-AU", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            {!isToday && (
              <button
                type="button"
                onClick={goToday}
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-primary-deep"
              >
                Today
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={nextDay}
            aria-label="Next day"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-primary-mist hover:text-primary"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-line-soft px-2 pb-2.5 text-[10px] font-medium tracking-[0.2em] text-muted uppercase sm:gap-4 sm:px-3">
          <span>Prayer</span>
          <span className="w-[64px] whitespace-nowrap text-right sm:w-[74px]">
            Athan
          </span>
          <span className="w-[64px] whitespace-nowrap text-right sm:w-[74px]">
            Iqamah
          </span>
        </div>

        {prayers.map((p) => {
          const Icon = ICONS[p.name] || Sun;
          const active = p.key === activeKey;
          return (
            <div
              key={p.name}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-2 py-3 transition-colors duration-300 sm:gap-4 sm:px-3 ${
                active ? "bg-primary-mist" : "hover:bg-bg"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon
                  size={18}
                  weight="duotone"
                  className={active ? "text-primary" : "text-gold-deep"}
                />
                <span className="truncate font-heading text-[15px] font-medium text-ink">
                  {p.name}{" "}
                  <span className="font-arabic text-sm font-normal text-muted">
                    {p.arabic}
                  </span>
                </span>
              </span>
              <span className="w-[64px] whitespace-nowrap text-right font-heading text-[15px] tabular-nums text-ink-soft sm:w-[74px]">
                {p.athan}
              </span>
              <span
                className={`w-[64px] whitespace-nowrap text-right font-heading text-[15px] font-semibold tabular-nums sm:w-[74px] ${
                  active ? "text-primary" : "text-ink"
                }`}
              >
                {p.iqamah}
              </span>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
