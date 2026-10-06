import Reveal from "./Reveal";
import PrayerTimesWidget from "./PrayerTimesWidget";
import GirihPattern from "./GirihPattern";

export default function PrayerTimes() {
  return (
    <section
      className="section relative overflow-hidden bg-white"
      id="prayer"
    >
      <GirihPattern className="pointer-events-none absolute inset-0" />
      <div className="container relative">
        <Reveal className="section-head">
          <span className="eyebrow">Daily Schedule</span>
          <h2 className="section-title">Prayer Times</h2>
          <p className="section-sub">
            Accurate daily prayer times for Masjid As Sunnah, Lakemba — with
            Athan and Iqamah for every prayer.
          </p>
        </Reveal>

        <PrayerTimesWidget />
      </div>
    </section>
  );
}
