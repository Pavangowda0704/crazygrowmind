import ScrollReveal from "../ScrollReveal";

export default function StatsSection() {
  return (
    <section className="container">
      <div className="stats" id="stats-section">
        <div className="stats-grid">
          <ScrollReveal variant="fade-up" delay={0} className="stat-item">
            <span className="stat-number">12M+</span>
            <span className="stat-label">Organic Impressions</span>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} className="stat-item">
            <span className="stat-number">150+</span>
            <span className="stat-label">Successful Campaigns</span>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.3} className="stat-item">
            <span className="stat-number">4.8★</span>
            <span className="stat-label">Client Satisfaction</span>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.45} className="stat-item">
            <span className="stat-number">300%</span>
            <span className="stat-label">Average ROAS Gains</span>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
