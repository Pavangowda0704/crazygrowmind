import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { truncateToWordBoundary } from "../../utils/text";

export default function ServicesGrid({ filteredServices, selectedService, onSelectService, IconMap }) {
  return (
    <>
      <ScrollReveal variant="fade-up" className="section-header" style={{ marginTop: "var(--spacing-xl)" }}>
        <span className="section-tag">Click to Select</span>
        <h3 className="section-title">Explore Capabilities Grid</h3>
        <p className="section-desc">Click any service to view its strategic details and specific benefits above.</p>
      </ScrollReveal>

      <div className="grid-4" id="services-grid-container">
        {filteredServices.map((service, index) => {
          const IconComponent = IconMap[service.iconName] || Sparkles;
          const isSelected = selectedService?.id === service.id;
          return (
            <ScrollReveal
              key={service.id}
              variant="fade-up"
              delay={(index % 4) * 0.05}
              className={`service-grid-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectService(service)}
              id={`service-grid-item-${service.id}`}
            >
              <div className="service-grid-icon">
                <IconComponent size={20} />
              </div>
              <h4 className="service-grid-title">{service.title}</h4>
              <p className="service-grid-desc">{truncateToWordBoundary(service.description, 85)}</p>
              
              <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderTop: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: isSelected ? "var(--primary-gold)" : "var(--color-mid-gray)" }}>
                  {isSelected ? "Selected" : "Select to Focus"}
                </span>
                <Link 
                  to={`/services/${service.id}`} 
                  className="service-card-link" 
                  style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--primary-gold)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Full Page <ArrowRight size={12} />
                </Link>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </>
  );
}
