import {
  Clock,
  CalendarBlank,
  GlobeSimple,
  ArrowSquareOut,
  ArrowRight,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import PageHero from "../components/PageHero";
import PrayerTimesWidget from "../components/PrayerTimesWidget";
import { PRAYER_WIDGET_URL } from "../config";
import bgImage from "../assets/photos/prayer-hero.jpg";
import {
  getNextFridayFormatted,
  getLastFridayOfMonth,
  formatDateKeyLong,
} from "../lib/prayerTimes";
import useJumuah from "../lib/useJumuah";

export default function PrayerTimesPage() {
  const nextFriday = getNextFridayFormatted(new Date());
  const lastFriMonth = getLastFridayOfMonth(new Date());
  const jumuah = useJumuah();
  const jumuahDate = formatDateKeyLong(jumuah.dateKey) || nextFriday;
  const jumuahParts = jumuah.athan.match(/^(.+?)\s+([AP]M)$/i);
  const jumuahTime = jumuahParts ? jumuahParts[1] : jumuah.athan;
  const jumuahMeridiem = jumuahParts ? jumuahParts[2] : "";

  return (
    <>
      <PageHero
        bg={bgImage}
        eyebrow="Prayer Times"
        title="Prayer Times"
        sub="Accurate daily prayer times for Masjid As Sunnah, Lakemba — updated by the masjid."
      />

      <main id="page">
        {/* ── Timetable ── */}
        <section className="section relative isolate overflow-hidden border-t border-gold/30 bg-primary-deep">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 50% -10%, rgba(3,137,74,0.35), transparent 70%)",
            }}
          />
          <div className="container relative">
            <PrayerTimesWidget />
          </div>
        </section>

        {/* ── Jumu'ah ── */}
        <section className="section" id="jumuah">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <Reveal>
                  <span className="eyebrow">Jumu'ah</span>
                  <h2 className="section-title">Jummah Khutbah</h2>
                  <p className="lede mt-6">
                    The weekly gathering — a khutbah and congregational prayer
                    held every Friday at Masjid As Sunnah.
                  </p>
                </Reveal>

                <Reveal delay={90}>
                  <div className="mt-8 space-y-5">
                    <div className="flex gap-4 rounded-2xl border border-line-soft bg-surface p-6">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-mist text-primary">
                        <Clock size={20} weight="duotone" />
                      </span>
                      <div>
                        <p className="font-heading text-[15px] font-semibold">
                          Arrive early
                        </p>
                        <p className="mt-1 text-[14.5px] leading-relaxed text-muted">
                          It is recommended to come 10–15 minutes before the
                          khutbah starts, in sha Allah.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 rounded-2xl border border-line-soft bg-surface p-6">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-mist text-primary">
                        <GlobeSimple size={20} weight="duotone" />
                      </span>
                      <div>
                        <p className="font-heading text-[15px] font-semibold">
                          English &amp; Arabic
                        </p>
                        <p className="mt-1 text-[14.5px] leading-relaxed text-muted">
                          Lectures are delivered in <strong>English</strong> &amp;{" "}
                          <strong>Arabic</strong>, except for the last Friday of
                          the month (<strong>{lastFriMonth}</strong>) — which is
                          delivered in <strong>Arabic only</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 rounded-2xl border border-line-soft bg-surface p-6">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-mist text-primary">
                        <CalendarBlank size={20} weight="duotone" />
                      </span>
                      <div>
                        <p className="font-heading text-[15px] font-semibold">
                          Next Jumu'ah
                        </p>
                        <p className="mt-1 text-[14.5px] leading-relaxed text-muted">
                          {jumuahDate} — Levels 1 &amp; 2, Haldon Street Waqf
                          Building, Lakemba.
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-6">
                <Reveal delay={160}>
                  <div className="relative overflow-hidden rounded-3xl keep-radius border border-line-soft bg-surface shadow-lg">
                    <div className="bg-gradient-to-br from-primary via-primary-dark to-primary-deep px-8 py-10 text-white md:px-10 md:py-12">
                      <p className="text-[11px] font-medium tracking-[0.3em] text-gold uppercase">
                        Every Friday
                      </p>
                      <p className="mt-4 font-display text-[clamp(52px,8vw,88px)] leading-none font-bold tracking-[-0.03em]">
                        {jumuahTime}
                        <span className="ml-3 text-[clamp(20px,2.5vw,28px)] font-medium tracking-normal text-white/70">
                          {jumuahMeridiem}
                        </span>
                      </p>
                      <p className="mt-4 text-[15px] text-white/70">
                        Khutbah begins — followed by the congregational prayer.
                      </p>
                      <div className="mt-8 flex flex-wrap items-center gap-4 text-[13.5px] text-white/75">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                          <CalendarBlank size={15} weight="duotone" />
                          {jumuahDate}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                          <Clock size={15} weight="duotone" />
                          Arrive 10–15 min early
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 md:px-10">
                      <div>
                        <p className="font-heading text-[15px] font-semibold">
                          This week's timetable
                        </p>
                        <p className="text-[13.5px] text-muted">
                          Full Athan &amp; Iqamah times for every prayer.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to="/timetable" className="btn btn-primary">
                          Weekly timetable
                          <ArrowRight size={14} weight="bold" />
                        </Link>
                        <a
                          href={PRAYER_WIDGET_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                        >
                          MasjidBox
                          <ArrowSquareOut size={14} weight="bold" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
