import Reveal from "./Reveal";
import PrayerTimesWidget from "./PrayerTimesWidget";
import pattern from "../assets/background.png";

export default function PrayerTimes() {
  return (
    <section
      className="section relative overflow-hidden bg-primary-deep"
      id="prayer"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: `url(${pattern})`, backgroundSize: "560px auto" }}
      />

      <div className="container relative">
        <Reveal className="section-head">
          <span className="eyebrow">Daily Schedule</span>
          <h2 className="section-title text-white">Prayer Times</h2>
          <p className="section-sub text-white/55">
            Accurate daily prayer times for Masjid As Sunnah, Lakemba — with
            Athan and Iqamah for every prayer.
          </p>
        </Reveal>

        <PrayerTimesWidget />
      </div>
    </section>
  );
}
