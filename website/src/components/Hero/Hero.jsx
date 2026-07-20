import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import "../../styles/components/Hero.css";
import heroBgImage from "../../assets/images/hero-bg.png";

export default function Hero() {
  // Motion container variants for staggered child entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section
      className="hero-section-container"
      id="hero-interactive-showcase"
      style={{ backgroundImage: `url(${heroBgImage})` }}
    >
      {/* Animated Abstract Visual Background Hooks */}
      <div className="hero-background-effects">
        <motion.div 
          className="ambient-glow glow-gold"
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            x: [0, 50, -30, 20, 0],
            y: [0, -40, 60, -20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="ambient-glow glow-charcoal"
          animate={{
            scale: [1, 0.85, 1.15, 0.95, 1],
            x: [0, -60, 40, -30, 0],
            y: [0, 50, -40, 30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="hero-grid-pattern" />
      </div>

      <div className="container hero-inner-wrapper">
        <motion.div 
          className="hero-content-box"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline Badge */}
          <motion.div className="hero-badge-tag" variants={itemVariants}>
            <span className="badge-sparkle">
              <Sparkles size={13} />
            </span>
            <span>Premium Marketing & Creative Agency</span>
          </motion.div>

          {/* Large High-Impact Headline with Gold Accent */}
          <motion.h1 className="hero-display-headline" variants={itemVariants}>
            We Engineer <span className="text-gold-gradient">Viral Momentum</span> <br />
            for Bold Indian Brands
          </motion.h1>

          {/* Descriptive Sub-headline */}
          <motion.p className="hero-subtext-desc" variants={itemVariants}>
            CrazyGrowMind Studio blends high-ROAS performance marketing with culturally viral meme intelligence, luxury brand storytelling, and exquisite designs.
          </motion.p>

          {/* Dual Action Buttons (CTA) */}
          <motion.div className="hero-cta-button-group" variants={itemVariants}>
            <Link to="/contact" className="btn-primary hero-btn-main" id="hero-main-cta">
              Schedule Free Audit <ArrowRight size={16} className="btn-arrow-icon" />
            </Link>
            <Link to="/portfolio" className="btn-secondary hero-btn-sub" id="hero-sub-cta">
              Explore Our Portfolio
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle Visual Hook Indicator */}
      <div className="scroll-indicator-container">
        <motion.div 
          className="scroll-indicator-mouse"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="scroll-indicator-wheel" />
        </motion.div>
      </div>
    </section>
  );
}