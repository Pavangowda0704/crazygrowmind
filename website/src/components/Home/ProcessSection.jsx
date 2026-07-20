import ScrollReveal from "../ScrollReveal";

export default function ProcessSection() {
  return (
    <section className="process">
      <div className="container">
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">The Blueprint</span>
          <h2 className="section-title">Our Growth Process</h2>
          <p className="section-desc">From initial discovery to viral compounding, here is how we align with your brand metrics.</p>
        </ScrollReveal>

        <div className="process-grid">
          <ScrollReveal variant="fade-up" delay={0} className="process-step">
            <span className="process-number">01</span>
            <h4>Brand Audit & Research</h4>
            <p>We dissect your existing digital channels, analyze competitor metrics, and isolate immediate conversion opportunities.</p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.15} className="process-step">
            <span className="process-number">02</span>
            <h4>Creative Calibration</h4>
            <p>Our creative leads draft customized visual guidelines, meme templates, and performance ad scripts for review.</p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.3} className="process-step">
            <span className="process-number">03</span>
            <h4>Strategic Testing</h4>
            <p>We deploy small-budget tests across multiple hooks and demographics to identify the highest ROI creative combinations.</p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.45} className="process-step">
            <span className="process-number">04</span>
            <h4>Viral Scale-Up</h4>
            <p>We channel budget into winning structures, trigger our organic distribution channels, and scale your brand predictably.</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
