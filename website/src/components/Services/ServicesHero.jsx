import ScrollReveal from "../ScrollReveal";

export default function ServicesHero() {
  return (
    <section className="services-hero">
      <ScrollReveal variant="zoom-out" className="container">
        <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Our Service Deck</span>
        <h1>Interactive <span>Creative Solutions</span></h1>
        <p>We operate across 16 specialized digital, creative, and physical formats, calibrated to capture mindshare and drive direct conversions.</p>
      </ScrollReveal>
    </section>
  );
}
