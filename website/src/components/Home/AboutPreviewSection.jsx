import { Link } from "react-router-dom";
import { Flame, Zap } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import aboutPreviewImg from "../../assets/images/misc/about-preview-workspace.jpg";

export default function AboutPreviewSection() {
  return (
    <section className="home-about">
      <div className="container about-preview-grid">
        <ScrollReveal variant="fade-right" className="about-preview-content">
          <span className="section-tag">About The Studio</span>
          <h2 className="section-title">Where Mindless Scrolling Meets Mindful Growth</h2>
          <p className="section-desc" style={{ color: "var(--color-mid-gray)" }}>
            At CrazyGrowMind Studio, we are a hybrid marketing collective. We reject the boring, repetitive strategies of traditional corporate agencies.
          </p>
          <p className="section-desc" style={{ color: "var(--color-light-gray)", fontSize: "0.95rem" }}>
            Instead, we look deep into Indian internet habits, local meme sub-cultures, and visual psychological cues to craft campaigns that organic algorithms love to distribute. We represent the new generation of consumer attention builders.
          </p>
          
          <div className="about-preview-features">
            <div className="about-preview-feature">
              <div className="feature-icon-wrapper">
                <Flame size={18} />
              </div>
              <div className="feature-text">
                <h4>Trend-Jacking Sovereignty</h4>
                <p>We draft and publish campaign responses to cultural events within hours, not weeks.</p>
              </div>
            </div>
            
            <div className="about-preview-feature">
              <div className="feature-icon-wrapper">
                <Zap size={18} />
              </div>
              <div className="feature-text">
                <h4>Surgical Ad Spend Optimizations</h4>
                <p>Every rupee of your ad spend is micro-managed using advanced behavioral audience segmentation.</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "10px" }}>
            <Link to="/about" className="btn-secondary" style={{ padding: "10px 20px" }}>
              Learn Our Full Story
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-left" className="about-preview-image">
          <img
            src={aboutPreviewImg}
            alt="CrazyGrowMind Studio Creative Workspace"
            referrerPolicy="no-referrer"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
