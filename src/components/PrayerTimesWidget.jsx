import { useState, useEffect } from "react";
import {
  SunDim,
  Sun,
  SunHorizon,
  CloudSun,
  MoonStars,
  UsersThree,
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
  Asr: CloudSun,
  Maghrib: MoonStars,
  Isha: MoonStars,
};

function addDaysLocal(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* MM:SS under an hour, otherwise HH:MM — always a single gold pair. */
function bigPair(cd) {
  if (!cd) return null;
  const total = (+cd.hours) * 3600 + (+cd.minutes) * 60 + (+cd.seconds);
  return total < 3600 ? [cd.minutes, cd.seconds] : [cd.hours, cd.minutes];
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
      <div className="mx-auto max-w-5xl animate-pulse border border-line-soft bg-bg">
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
        ? `until the Iqamah at ${state.targetTime}`
        : `until the Athan at ${state.targetTime}`;
    left = {
      prayer: state.prayer,
      cd,
      sub,
      phase: state.phase,
      eyebrow:
        state.phase === "iqamah"
          ? "Athan Called"
          : cd
            ? "Next Prayer"
            : "Today",
    };
    activeKey = state.prayer.key;
  } else if (daysFromToday > 0) {
    const fajr = prayers.find((p) => p.key === "fajr");
    const cd = getCountdownParts(navDate, fajr.athan, now);
    left = {
      prayer: fajr,
      cd,
      sub: `until the Athan at ${fajr.athan}`,
      phase: "athan",
      eyebrow: cd ? "Next Prayer" : "Today",
    };
    activeKey = "fajr";
  } else {
    const isha = prayers.find((p) => p.key === "isha");
    const cd = getElapsedParts(navDate, isha.iqamah, now);
    left = {
      prayer: isha,
      cd,
      sub: `since the Iqamah at ${isha.iqamah}`,
      phase: "past",
      eyebrow: "Today",
    };
    activeKey = "isha";
  }

  const goToday = () => setNavDate(startOfToday());
  const goTomorrow = () => setNavDate(addDaysLocal(startOfToday(), 1));
  const isToday = daysFromToday === 0;
  const isTomorrow = daysFromToday === 1;
  const pair = bigPair(left.cd);

  const tabCls = (on) =>
    `transition-colors ${
      on
        ? "font-semibold text-ink"
        : "font-medium text-muted hover:text-ink"
    }`;

  return (
    <Reveal className="mx-auto max-w-5xl overflow-hidden border border-line-soft shadow-[0_30px_70px_-40px_rgba(15,74,54,0.45)] md:grid md:grid-cols-[minmax(0,360px)_1fr]">
      {/* ── Next prayer panel ── */}
      <div
        className="relative flex flex-col justify-center overflow-hidden bg-[#070d09] p-8 text-white md:min-h-[430px] md:p-10"
        style={{
          backgroundImage:
            "radial-gradient(110% 90% at 68% -10%, rgba(42,138,100,0.38), rgba(7,13,9,0) 62%)",
        }}
      >
        <div className="flex items-center gap-2.5 text-[11px] font-medium tracking-[0.28em] text-gold uppercase">
          <Sun size={13} weight="fill" className="text-gold" />
          {left.eyebrow}
        </div>

        <div className="mt-7 flex items-baseline gap-3">
          <span className="font-display text-[clamp(34px,5vw,44px)] leading-none font-semibold text-white">
            {left.prayer.name}
          </span>
          <span className="font-arabic text-[22px] leading-none text-gold/85">
            {left.prayer.arabic}
          </span>
        </div>

        {pair ? (
          <>
            <div className="mt-6 font-display text-[clamp(46px,6.5vw,64px)] leading-none font-semibold tabular-nums text-gold">
              {pair[0]}
              <span className="mx-0.5 text-[0.6em] font-normal text-gold/55">
                :
              </span>
              {pair[1]}
            </div>
            <p className="mt-4 text-[14.5px] text-white/70">{left.sub}</p>
          </>
        ) : (
          <p className="mt-6 text-[14.5px] text-white/70">
            Check prayer times for today
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <span className="text-[11px] font-semibold tracking-[0.26em] text-white/40 uppercase">
            Athan
          </span>
          <span className="text-[14px] font-medium tabular-nums text-white/85">
            {left.prayer.athan}
          </span>
        </div>
      </div>

      {/* ── Times table ── */}
      <div className="bg-surface py-5 md:py-6">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 sm:px-6 md:px-8">
          <div className="flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase">
            <button
              type="button"
              onClick={goToday}
              className={`${tabCls(isToday)} tracking-[0.18em] uppercase`}
            >
              Today
            </button>
            <span aria-hidden className="text-line">
              —
            </span>
            <button
              type="button"
              onClick={goTomorrow}
              className={`${tabCls(isTomorrow)} tracking-[0.18em] uppercase`}
            >
              Tomorrow
            </button>
          </div>

          <div className="flex shrink-0 items-center text-[10px] font-medium tracking-[0.18em] text-muted uppercase sm:text-[10.5px]">
            <span className="w-[68px] text-right sm:w-[86px]">Athan</span>
            <span className="w-[74px] text-right sm:w-[96px]">Iqamah</span>
          </div>
        </div>

        {prayers.map((p, i) => {
          const Icon = ICONS[p.name] || Sun;
          const active = p.key === activeKey;
          const sunrise = p.key === "sunrise";
          return (
            <div
              key={p.name}
              className={`relative grid grid-cols-[18px_1fr_auto_auto] items-center gap-x-2.5 px-4 py-3.5 transition-colors duration-300 sm:gap-x-3.5 sm:px-6 md:px-8 ${
                i ? "border-t border-line-soft" : ""
              } ${active ? "bg-[#eef3e4]" : ""}`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[3px] bg-gold"
                />
              )}

              <Icon
                size={18}
                weight="regular"
                className={active ? "text-gold" : "text-primary-soft/40"}
              />

              <span className="flex min-w-0 items-baseline gap-2">
                <span
                  className={`truncate text-[15px] font-medium sm:text-[16px] ${
                    active ? "text-gold-deep" : "text-ink"
                  }`}
                >
                  {p.name}
                </span>
                <span
                  className={`font-arabic shrink-0 text-[11px] sm:text-[13px] ${
                    active ? "text-gold-deep/80" : "text-primary-soft/70"
                  }`}
                >
                  {p.arabic}
                </span>
              </span>

              <span
                className={`w-[68px] text-right text-[13px] tabular-nums sm:w-[86px] sm:text-[14.5px] ${
                  active ? "text-ink-soft" : "text-muted"
                }`}
              >
                {sunrise ? "Sunrise" : p.athan}
              </span>

              <span
                className={`w-[74px] text-right text-[15px] font-semibold tabular-nums sm:w-[96px] sm:text-[17px] ${
                  active ? "text-primary-soft" : "text-ink"
                }`}
              >
                {sunrise ? p.athan : p.iqamah}
              </span>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
