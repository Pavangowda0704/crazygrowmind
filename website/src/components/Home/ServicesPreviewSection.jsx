import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function ServicesPreviewSection({ services, isLoading, IconMap }) {
  return (
    <section className="home-services">
      <div className="container">
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">Our Capabilities</span>
          <h2 className="section-title">Creative Services Engineered for Future Scale</h2>
          <p className="section-desc">A look at how we build and scale brands. All services are ready to be bound dynamically from database APIs.</p>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid-3" style={{ textAlign: "center", padding: "40px" }}>
            <p>Simulating secure API retrieval...</p>
          </div>
        ) : (
          <div className="grid-3">
            {services.map((service, index) => {
              const IconComponent = IconMap[service.iconName] || Sparkles;
              return (
                <ScrollReveal
                  key={service.id}
                  variant="fade-up"
                  delay={index * 0.08}
                  className="service-card"
                  id={`service-card-${service.id}`}
                >
                  <div className="service-card-icon">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <Link to={`/services/${service.id}`} className="service-card-link">
                    Explore Details <ArrowRight size={14} />
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        <ScrollReveal variant="fade-up" delay={0.2} style={{ textAlign: "center", marginTop: "var(--spacing-xl)" }}>
          <Link to="/services" className="btn-primary">
            View All 16 Services <ArrowRight size={16} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
