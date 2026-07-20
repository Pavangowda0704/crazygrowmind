import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function ContactCtaSection() {
  return (
    <section className="contact-cta">
      <div className="container">
        <ScrollReveal variant="zoom-in" className="contact-cta-card">
          <h2 className="contact-cta-title">
            Ready to Turn Your Brand Into a <span>Cultural Momentum Force</span>?
          </h2>
          <p className="contact-cta-desc">
            Schedule your 30-minute discovery consultation. We will audit your current social accounts and suggest 3 viral strategies you can deploy immediately.
          </p>
          <div style={{ marginTop: "10px" }}>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: "var(--primary-gold)", color: "var(--color-black)" }} id="cta-action-button">
              Book My Free Discovery Session <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
