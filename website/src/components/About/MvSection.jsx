import { Target, Eye } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

/**
 * MvSection (Mission and Vision) renders dual bento-style cards
 * representing the underlying principles and directional objectives of the studio.
 */
export default function MvSection() {
  return (
    <section className="mv-section">
      <div className="container">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">Direction</span>
          <h2 className="section-title">Our Strategic Focus</h2>
          <p className="section-desc">Guided by clear, uncompromising principles designed to scale brand equity and sales volume.</p>
        </ScrollReveal>

        {/* Bento Grid layout containing Mission and Vision cards */}
        <div className="mv-grid">
          {/* Card 1: Our Mission */}
          <ScrollReveal variant="fade-right" delay={0.1} className="mv-card">
            <div className="mv-icon">
              <Target size={24} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To empower visionary Indian brands to bypass advertising fatigue. We construct authentic, attention-grabbing digital campaigns that drive customer engagement and deliver compounding commercial growth.
            </p>
          </ScrollReveal>

          {/* Card 2: Our Vision */}
          <ScrollReveal variant="fade-left" delay={0.2} className="mv-card">
            <div className="mv-icon">
              <Eye size={24} />
            </div>
            <h3>Our Vision</h3>
            <p>
              To become India's leading boutique growth agency, recognized for cultural trend mastery, uncompromising visual aesthetics, and verifiable ad-spend capital efficiency.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
