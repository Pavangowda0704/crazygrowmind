import ScrollReveal from "../ScrollReveal";

/**
 * AboutHero component renders the top banner of the About Us page.
 * It introduces the agency name and sets the general creative tone.
 */
export default function AboutHero() {
  return (
    <section className="about-hero">
      <ScrollReveal variant="zoom-out" className="container">
        {/* Visual category tag styled with primary gold accent */}
        <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Who We Are</span>
        {/* Dynamic typographical title with highlighted text */}
        <h1>We Are <span>CrazyGrowMind</span></h1>
        {/* Brief mission subtitle text explaining the core agency purpose */}
        <p>An elite, conversion-obsessed creative crew redefining corporate advertising frameworks in the Indian digital ecosystem.</p>
      </ScrollReveal>
    </section>
  );
}
