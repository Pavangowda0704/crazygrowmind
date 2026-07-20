/**
 * ContactHero renders the headline and contextual introduction for the Contact page.
 * It sets the immediate tone for inbound inquiries and consulting calls.
 */
export default function ContactHero() {
  return (
    <section className="contact-hero">
      <div className="container">
        {/* Contact category context badge */}
        <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Contact Us</span>
        {/* Dynamic header typography */}
        <h1>Initiate <span>Growth Discussion</span></h1>
        {/* Short paragraph explaining response SLA and what they should expect */}
        <p>Ready to establish a viral creative strategy for your brand? Tell us about your metrics, and our leads will review within 4 hours.</p>
      </div>
    </section>
  );
}
