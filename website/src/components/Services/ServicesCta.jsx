import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

export default function ServicesCta() {
  return (
    <section className="services-section" style={{ background: "var(--color-black)", color: "var(--color-white)", textAlign: "center" }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <ScrollReveal variant="zoom-in" className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <span className="section-tag" style={{ color: "var(--primary-gold)" }}>Consultation</span>
          <h2 className="section-title" style={{ color: "var(--color-white)" }}>Need a Custom Growth Framework?</h2>
          <p style={{ color: "var(--color-light-gray)", maxWidth: "550px", fontSize: "1.05rem" }}>
            Let's build a customized package that mixes physical promotions, performance ads, and viral humor to scale your metrics predictably.
          </p>
          <div style={{ marginTop: "10px" }}>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: "var(--primary-gold)", color: "var(--color-black)" }} id="services-footer-cta">
              Schedule Free Growth Session
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
