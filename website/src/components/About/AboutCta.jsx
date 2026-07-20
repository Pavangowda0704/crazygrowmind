import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

/**
 * AboutCta component renders the footer call to action block on the About page.
 * It features a direct prompt to guide the visitor towards scheduling a discovery session.
 */
export default function AboutCta() {
  return (
    <section className="values-section" style={{ background: "var(--color-black)", color: "var(--color-white)", textAlign: "center" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <ScrollReveal variant="zoom-in" className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          {/* Tag indicating immediate contact intent */}
          <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Work With Us</span>
          {/* Main title directing user focus to brand momentum */}
          <h2 className="section-title" style={{ color: "var(--color-white)" }}>Let's Create Viral Momentum For Your Brand</h2>
          {/* Informative text summarizing why they should take action */}
          <p style={{ color: "var(--color-light-gray)", maxWidth: "550px", fontSize: "1rem" }}>
            Ready to partner with a senior creative group that operates like co-owners? Get in touch today for a free strategic proposal.
          </p>
          {/* Standard golden-accent button routing users to the contact form */}
          <div style={{ marginTop: "10px" }}>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: "var(--primary-gold)", color: "var(--color-black)" }} id="about-footer-cta">
              Get Started Now
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
