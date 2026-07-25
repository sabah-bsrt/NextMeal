"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SCROLL_THRESHOLD = 150;

function getScrollTop(): number {
  if (typeof window === "undefined") return 0;
  return (
    window.scrollY ??
    document.documentElement.scrollTop ??
    document.body.scrollTop ??
    0
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(getScrollTop() > SCROLL_THRESHOLD);
    };
    const scrollEl = document.scrollingElement ?? document.documentElement ?? document.body;
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 md:bottom-6 left-4 z-[60] w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
