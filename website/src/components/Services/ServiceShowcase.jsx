import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function ServiceShowcase({ selectedService, showcaseRef, IconMap }) {
  if (!selectedService) return null;

  return (
    <ScrollReveal 
      key={selectedService.id}
      variant="fade-up" 
      className="service-showcase" 
      ref={showcaseRef} 
      id="active-service-showcase"
    >
      <div className="service-showcase-info">
        <span className="service-showcase-tag">{selectedService.category}</span>
        <h2 className="service-showcase-title">
          {(() => {
            const IconComponent = IconMap[selectedService.iconName] || Sparkles;
            return <IconComponent size={32} />;
          })()}
          {selectedService.title}
        </h2>
        <p className="service-showcase-desc">{selectedService.description}</p>
        <p className="service-showcase-details">{selectedService.details}</p>
        
        <div style={{ marginTop: "var(--spacing-sm)", display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link 
            to={`/services/${selectedService.id}`} 
            className="btn-primary"
            id="showcase-view-page-button"
            style={{ backgroundColor: "var(--primary-gold)", color: "var(--color-black)" }}
          >
            View Dedicated Service Page <ArrowRight size={16} />
          </Link>
          <Link 
            to={`/contact?service=${encodeURIComponent(selectedService.title)}`} 
            className="btn-primary"
            style={{ backgroundColor: "var(--color-black)", color: "var(--color-white)", border: "1px solid var(--color-border)" }}
            id="showcase-cta-button"
          >
            Inquire About This Service
          </Link>
        </div>
      </div>

      {/* Benefits checklist box */}
      <div className="service-showcase-benefits">
        <h4>Why Partner On This:</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {selectedService.benefits.map((benefit, index) => (
            <div key={index} className="service-benefit-item">
              <CheckCircle2 size={16} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
