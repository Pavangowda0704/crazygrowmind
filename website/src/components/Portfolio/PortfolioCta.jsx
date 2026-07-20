import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

/**
 * PortfolioCta renders the bottom call-to-action block on the Portfolio page.
 * It prompts users to contact the agency to build their own custom viral marketing strategy.
 */
export default function PortfolioCta() {
  return (
    <section className="gallery-section" style={{ background: "var(--color-black)", color: "var(--color-white)", textAlign: "center" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <ScrollReveal variant="zoom-in" className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          {/* Accent section tag */}
          <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Case Inquiries</span>
          {/* Header text */}
          <h2 className="section-title" style={{ color: "var(--color-white)" }}>Want to Put Your Metrics on This List?</h2>
          {/* Descriptive text */}
          <p style={{ color: "var(--color-light-gray)", maxWidth: "550px", fontSize: "1.05rem" }}>
            We are ready to build a viral, performance-tested ad blueprint custom tailored for your business segment. Let's write your success story.
          </p>
          {/* Action Button routing to contact form */}
          <div style={{ marginTop: "10px" }}>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: "var(--primary-gold)", color: "var(--color-black)" }} id="portfolio-footer-cta">
              Schedule My Brand Strategy Audit
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
