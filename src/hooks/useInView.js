import { useEffect, useRef, useState } from "react";

// Stable identity so the effect doesn't re-run (observer churn) every render.
const DEFAULT_OPTIONS = {
  threshold: 0.15,
  rootMargin: "0px 0px -8% 0px",
};

export default function useInView(options = DEFAULT_OPTIONS) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { ...DEFAULT_OPTIONS, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
