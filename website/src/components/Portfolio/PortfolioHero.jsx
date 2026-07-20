import ScrollReveal from "../ScrollReveal";

/**
 * PortfolioHero renders the headline, category tag, and introduction for 
 * the Case Studies portfolio gallery.
 */
export default function PortfolioHero() {
  return (
    <section className="portfolio-hero">
      <ScrollReveal variant="zoom-out" className="container">
        {/* Case Studies context tag */}
        <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Case Studies</span>
        {/* Display Heading */}
        <h1>Campaigns That <span>Moved Markets</span></h1>
        {/* Explanatory introduction block */}
        <p>We build highly contagious digital campaigns, premium brand redesigns, and store promotions with verifiable metrics.</p>
      </ScrollReveal>
    </section>
  );
}
