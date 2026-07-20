import { useState, useEffect } from "react";

/**
 * Custom hook to track whether the window has been scrolled past a certain threshold.
 * @param {number} threshold - The scroll threshold in pixels.
 * @returns {boolean} - True if window.scrollY is greater than the threshold.
 */
export default function useScrollPosition(threshold = 50) {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsPastThreshold(window.scrollY > threshold);
    };

    // Add listener on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    // Clean up on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isPastThreshold;
}
