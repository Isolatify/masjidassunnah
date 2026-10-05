import { useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import CalligraphyBand from "./components/CalligraphyBand";
import { scrollToTarget, resetScroll } from "./lib/lenis";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import TimetablePage from "./pages/TimetablePage";
import CollegesPage from "./pages/CollegesPage";
import ICOAPage from "./pages/ICOAPage";
import DonatePage from "./pages/DonatePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventRegisterPage from "./pages/EventRegisterPage";
import NotFound from "./pages/NotFound";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  // Layout effect: scroll position resets before the new route paints.
  useLayoutEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const timers = [];
      let done = false;
      const scrollToEl = () => {
        if (done) return;
        const el = document.getElementById(id);
        if (el) {
          done = true;
          // scroll-padding-top on <html> handles the sticky-header offset.
          scrollToTarget(el);
        }
      };
      [80, 400, 1200, 2500].forEach((delay) => {
        timers.push(
          setTimeout(() => {
            scrollToEl();
          }, delay)
        );
      });
      return () => timers.forEach(clearTimeout);
    }
    resetScroll();
    return undefined;
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="site">
      <ScrollManager />
      <Topbar />
      <div className="route-view" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/prayer" element={<PrayerTimesPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/colleges" element={<CollegesPage />} />
          <Route path="/icoa" element={<ICOAPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/events/:slug/register" element={<EventRegisterPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <CalligraphyBand />
      <Footer />
    </div>
  );
}
