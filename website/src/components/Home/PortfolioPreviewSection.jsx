import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function PortfolioPreviewSection({ projects, isLoading }) {
  return (
    <section className="home-portfolio">
      <div className="container">
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">Case Studies</span>
          <h2 className="section-title">Campaigns That Moved Markets</h2>
          <p className="section-desc">A selection of recent campaigns designed to capture mindshare and accelerate business growth.</p>
        </ScrollReveal>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading portfolio showcase...</p>
          </div>
        ) : (
          <div className="grid-3" style={{ marginBottom: "var(--spacing-xl)" }}>
            {projects.map((project, index) => (
              <ScrollReveal
                key={project.id}
                variant="fade-up"
                delay={index * 0.15}
                className="portfolio-card"
                id={`portfolio-card-${project.id}`}
              >
                <div className="portfolio-card-image">
                  <img src={project.image} alt={project.title} referrerPolicy="no-referrer" />
                  <span className="portfolio-card-tag">{project.category}</span>
                </div>
                <div className="portfolio-card-content">
                  <span className="portfolio-card-client">{project.client}</span>
                  <h3 className="portfolio-card-title">{project.title}</h3>
                  
                  <div className="portfolio-card-results">
                    {project.results.map((result, idx) => (
                      <div key={idx} className="result-stat">
                        <span className="result-val">{result.value}</span>
                        <span className="result-lbl">{result.metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal variant="fade-up" delay={0.1} style={{ textAlign: "center" }}>
          <Link to="/portfolio" className="btn-primary">
            Explore Our Our Full Portfolio <ArrowRight size={16} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
