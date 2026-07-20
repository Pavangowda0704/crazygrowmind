import ScrollReveal from "../ScrollReveal";

/**
 * ValuesSection component outlines the four core operational tenets of CrazyGrowMind.
 * These govern internal production standards and client collaborations.
 */
export default function ValuesSection() {
  return (
    <section className="values-section">
      <div className="container">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">Core Tenets</span>
          <h2 className="section-title">The Values That Shape Us</h2>
          <p className="section-desc">Our actions are guided by key principles of creative precision, data integrity, and constant evolution.</p>
        </ScrollReveal>

        {/* 4-column grid display of company values */}
        <div className="grid-4">
          {/* Tenet 1: Transparency */}
          <ScrollReveal variant="fade-up" delay={0} className="value-card">
            <h3>Uncompromised Transparency</h3>
            <p>We provide live ad account views, direct analytics integration, and clear progress reviews. No hidden costs or inflated reports.</p>
          </ScrollReveal>

          {/* Tenet 2: Audacity */}
          <ScrollReveal variant="fade-up" delay={0.1} className="value-card">
            <h3>Cultural Audacity</h3>
            <p>We believe safe marketing is expensive marketing. We take calculated creative risks to hijack national conversations with clever humor.</p>
          </ScrollReveal>

          {/* Tenet 3: Quality Craft */}
          <ScrollReveal variant="fade-up" delay={0.2} className="value-card">
            <h3>Pixel-Perfect Pride</h3>
            <p>From visual balance to website page response speed, we maintain absolute architectural discipline. Craft is everything.</p>
          </ScrollReveal>

          {/* Tenet 4: Business ROAS */}
          <ScrollReveal variant="fade-up" delay={0.3} className="value-card">
            <h3>Direct ROAS Alignment</h3>
            <p>Every creative piece we design and every line of copy we draft is calibrated to support a specific, trackable stage of your sales funnel.</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
