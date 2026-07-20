import { Link } from "react-router-dom";
import { ShieldCheck, Target, HeartHandshake } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function WhyChooseSection() {
  return (
    <section className="why-choose">
      <div className="container why-choose-grid">
        <ScrollReveal variant="fade-right" className="why-choose-content">
          <span className="section-tag" style={{ color: "var(--primary-gold)" }}>The Studio Edge</span>
          <h2 className="section-title" style={{ color: "var(--color-white)" }}>Why India's Fastest Growing Brands Trust Us</h2>
          <p style={{ color: "var(--color-light-gray)", marginBottom: "var(--spacing-md)" }}>
            Traditional agencies measure activities—times posted, stock graphics made, reports sent. We measure enterprise outcomes: customer acquisition costs, brand virality, and conversion velocity.
          </p>
          <div>
            <Link to="/contact" className="btn-primary" style={{ backgroundColor: "var(--primary-gold)", color: "var(--color-black)" }}>
              Start Growing Now
            </Link>
          </div>
        </ScrollReveal>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <ScrollReveal variant="fade-left" delay={0} className="why-card">
            <div className="why-icon-wrapper">
              <ShieldCheck size={28} />
            </div>
            <div className="why-text">
              <h4>No-BS Transparency</h4>
              <p>We provide full, direct view access to your ad accounts, pixel data, and metrics. Zero hidden markups or obscure reporting metrics.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={0.15} className="why-card">
            <div className="why-icon-wrapper">
              <Target size={28} />
            </div>
            <div className="why-text">
              <h4>Cultural Meme Masters</h4>
              <p>We don't copy-paste global trends. We understand local Indian context, languages, and regional sentiment, which makes your message highly contagious.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={0.3} className="why-card">
            <div className="why-icon-wrapper">
              <HeartHandshake size={28} />
            </div>
            <div className="why-text">
              <h4>Partner-Level Dedication</h4>
              <p>We only accept a limited roster of high-potential clients at any given time. This guarantees elite, focused creative support on your account daily.</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
