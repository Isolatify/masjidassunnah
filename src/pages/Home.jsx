import Hero from "../components/Hero";
import About from "../components/About";
import PrayerTimes from "../components/PrayerTimes";
import Events from "../components/Events";
import LatestMedia from "../components/LatestMedia";
import SocialFeed from "../components/SocialFeed";
import Livestream from "../components/Livestream";
import Socials from "../components/Socials";
import AppDownload from "../components/AppDownload";
import Location from "../components/Location";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <PrayerTimes />
      <Events />
      <LatestMedia />
      <SocialFeed />
      <Livestream />
      <Socials />
      <AppDownload />
      <Location />
    </main>
  );
}
