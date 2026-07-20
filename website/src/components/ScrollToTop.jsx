import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import useScrollPosition from "../hooks/useScrollPosition";
import "../styles/components/ScrollToTop.css";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const isVisible = useScrollPosition(400);

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      id="scroll-to-top-btn"
    >
      <ArrowUp size={20} />
    </button>
  );
}
