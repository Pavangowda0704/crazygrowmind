import React from "react";
import { motion } from "motion/react";

/**
 * ScrollReveal - A premium reusable component for scroll-triggered animations.
 * Built on top of motion/react (Framer Motion v12).
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Component children to animate
 * @param {'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out' | 'none'} props.variant - Animation variant name
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.duration - Animation duration in seconds
 * @param {number} props.distance - Displacement distance in pixels for fade variants
 * @param {number} props.threshold - Intersection observer threshold (0 to 1)
 * @param {boolean} props.once - Whether animation should trigger only once or every time it enters the viewport
 * @param {string | number[]} props.ease - Cubic-bezier curve or ease name
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Additional inline styles
 * @param {string} props.id - HTML ID attribute
 */
export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.8,
  distance = 40,
  threshold = 0.15,
  once = true,
  ease = [0.16, 1, 0.3, 1], // Smooth custom cubic bezier for premium feel
  className = "",
  style = {},
  id
}) {
  // If variant is "none", render a plain div with normal motion properties
  if (variant === "none") {
    return (
      <div id={id} className={className} style={style}>
        {children}
      </div>
    );
  }

  // Get initial states and transitions based on the selected variant
  const getVariants = () => {
    switch (variant) {
      case "fade-up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 }
        };
      case "fade-down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 }
        };
      case "fade-left":
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 }
        };
      case "fade-right":
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 }
        };
      case "zoom-in":
        return {
          hidden: { opacity: 0, scale: 0.94 },
          visible: { opacity: 1, scale: 1 }
        };
      case "zoom-out":
        return {
          hidden: { opacity: 0, scale: 1.06 },
          visible: { opacity: 1, scale: 1 }
        };
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 }
        };
    }
  };

  const animVariants = getVariants();

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={animVariants}
      transition={{
        delay,
        duration,
        ease,
        type: "tween"
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollRevealStagger - A premium container component to stagger scroll-triggered child animations.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - ScrollReveal items
 * @param {number} props.staggerChildren - Time between staggered children animations in seconds
 * @param {number} props.delayChildren - Initial delay before first child starts animating in seconds
 * @param {number} props.threshold - Intersection observer threshold (0 to 1)
 * @param {boolean} props.once - Trigger only once
 * @param {string} props.className - CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 * @param {string} props.id - HTML ID attribute
 */
export function ScrollRevealStagger({
  children,
  staggerChildren = 0.12,
  delayChildren = 0,
  threshold = 0.1,
  once = true,
  className = "",
  style = {},
  id
}) {
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  };

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}
