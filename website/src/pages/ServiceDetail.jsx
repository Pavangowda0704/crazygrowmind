import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, Share2, Users, PenTool, Smile, MessageCircle, Sparkles, 
  Palette, Search, MousePointer, Facebook, Code, Camera, Video, 
  MapPin, Award, CheckCircle2, ArrowLeft, ArrowRight, Star, Send, Loader2
} from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";
import { agencyApi } from "../utils/api";
import "../styles/pages/ServiceDetail.css";
import "../styles/pages/Portfolio.css";

// Dynamic map to resolve string icon keys to Lucide icons
const IconMap = {
  TrendingUp, Share2, Users, PenTool, Smile, MessageCircle, Sparkles,
  Palette, Search, MousePointer, Facebook, Code, Camera, Video,
  MapPin, Award
};

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formResponse, setFormResponse] = useState(null);

  // Load the service and its related details
  useEffect(() => {
    const loadServiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      setFormResponse(null);

      try {
        const [currentService, servicesList, portfolioList] = await Promise.all([
          agencyApi.getServiceById(serviceId),
          agencyApi.getServices(),
          agencyApi.getPortfolio()
        ]);

        if (!currentService) {
          setError(`Service '${serviceId}' not found in our directory.`);
          setIsLoading(false);
          return;
        }

        setService(currentService);
        setAllServices(servicesList);

        // Filter projects: first look for exact serviceId match, 
        // fallback to projects in the same category if no exact match is found.
        let filtered = portfolioList.filter(proj => proj.serviceId === currentService.id);
        if (filtered.length === 0) {
          filtered = portfolioList.filter(proj => proj.category.toLowerCase() === currentService.category.toLowerCase());
        }
        // Take maximum of 3 items
        setRelatedProjects(filtered.slice(0, 3));

      } catch (err) {
        console.error("Failed to load service detail metrics:", err);
        setError("Unable to communicate with the service directory API. Please reload.");
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceDetails();
  }, [serviceId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormResponse({
        success: false,
        message: "Please provide both your name and email address to continue."
      });
      return;
    }

    setFormLoading(true);
    setFormResponse(null);

    try {
      const payload = {
        ...formData,
        service: service?.title || "General Query"
      };
      const res = await agencyApi.submitContactForm(payload);
      setFormResponse({
        success: true,
        message: res.message
      });
      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: ""
      });
    } catch (err) {
      console.error("Lead registration failed:", err);
      setFormResponse({
        success: false,
        message: "Something went wrong. Please try submitting again or contact our WhatsApp support."
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "60vh",
        gap: "16px"
      }}>
        <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary-gold)" }} />
        <p style={{ color: "var(--color-mid-gray)", fontWeight: 500 }}>Calibrating capability layout metrics...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2 className="section-title">Directory Error</h2>
        <p style={{ color: "var(--color-mid-gray)", margin: "16px 0 32px 0" }}>{error || "Service details could not be found."}</p>
        <Link to="/services" className="btn-primary">
          <ArrowLeft size={16} /> Return to Service Deck
        </Link>
      </div>
    );
  }

  // Determine suggestions (exclude current service, filter by same category first, or just take other services)
  const suggestions = allServices
    .filter(s => s.id !== service.id)
    .sort((a, b) => (b.category === service.category ? 1 : 0) - (a.category === service.category ? 1 : 0))
    .slice(0, 3);

  const ServiceIcon = IconMap[service.iconName] || Sparkles;

  return (
    <div className="service-detail-wrapper" id={`service-detail-page-${service.id}`}>
      {/* 1. High Impact Service Hero */}
      <section className="service-detail-hero">
        <div className="container service-detail-hero-content">
          <ScrollReveal variant="zoom-out">
            <span className="service-category-tag">{service.category} Division</span>
            <h1><span>{service.title}</span> Setup</h1>
            <p>{service.description}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Page Navigation Bar */}
      <div className="service-nav-bar">
        <div className="container service-nav-bar-container">
          <Link to="/services" className="back-to-services-link">
            <ArrowLeft size={16} /> Back to Capabilities Grid
          </Link>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-light-gray)" }}>
              Division: <strong>{service.category}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Split Information Section */}
      <section className="service-main-section">
        <div className="container service-info-grid">
          {/* Main detailed text block */}
          <ScrollReveal variant="fade-right" className="service-detailed-description">
            <span className="section-tag">Analytical Overview</span>
            <h2>How We Drive Growth</h2>
            <p>
              In modern markets, having excellent features is only half the battle. Our approach at CrazyGrowMind focuses heavily on strategic optimization: we build viral momentum, optimize search visibility, and design luxury user experiences.
            </p>
            <p className="details-expanded">
              {service.details || "Our specialized execution framework aligns creative output directly with performance data. We don't believe in generic content calendars. Instead, we build platform-native communication streams designed to trigger immediate conversion actions and establish long-term customer equity."}
            </p>
            <p>
              We run highly customized analytics dashboards that track exact impression pathways, scroll depth, form fill retention, and bounce parameters. Every recommendation is backed by empirical research and continuous split-testing, giving your brand a secure, compounding market advantage.
            </p>
          </ScrollReveal>

          {/* Side Benefits Panel */}
          <ScrollReveal variant="fade-left" className="service-benefits-sidebar">
            <h3>Strategic Deliverables</h3>
            <div className="service-benefit-card-list">
              {service.benefits && service.benefits.map((benefit, index) => {
                const advantageHeaders = [
                  "Strategic Advantage",
                  "Key Deliverable",
                  "Execution & Metrics",
                  "Continuous Optimization"
                ];
                const headerText = advantageHeaders[index] || "Value Highlight";
                return (
                  <div key={index} className="benefit-card-item">
                    <div className="benefit-card-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="benefit-card-text">
                      <h4>{headerText}</h4>
                      <p>{benefit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Relevant Case Studies from Portfolio */}
      {relatedProjects.length > 0 && (
        <section className="service-related-cases">
          <div className="container">
            <ScrollReveal variant="fade-up" className="section-header">
              <span className="section-tag">Case Evidence</span>
              <h2 className="section-title">Successful {service.title} Campaigns</h2>
              <p className="section-desc">Take a look at how we executed this specific methodology to deliver measurable business growth for our partners.</p>
            </ScrollReveal>

            <div className="case-studies-subgrid">
              {relatedProjects.map((project, idx) => (
                <ScrollReveal 
                  key={project.id} 
                  variant="fade-up" 
                  delay={idx * 0.1}
                  className="portfolio-grid-card"
                  style={{ cursor: "default" }}
                >
                  <div className="portfolio-grid-card-image">
                    <img src={project.image} alt={project.title} referrerPolicy="no-referrer" />
                    <span className="portfolio-grid-card-tag">{project.category}</span>
                  </div>
                  <div className="portfolio-grid-card-content">
                    <span className="portfolio-grid-card-client">{project.client}</span>
                    <h3 className="portfolio-grid-card-title">{project.title}</h3>
                    <p className="portfolio-grid-card-desc">{project.description}</p>
                    
                    <div className="portfolio-grid-card-results">
                      {project.results.map((res, i) => (
                        <div key={i} className="result-badge">
                          <span className="result-badge-val">{res.value}</span>
                          <span className="result-badge-lbl">{res.metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <Link to="/portfolio" className="btn-primary">
                View All Case Studies <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Custom Quote / Contact Form */}
      <section className="service-lead-form-section">
        <div className="container">
          <ScrollReveal variant="zoom-in" className="service-form-card">
            <div className="service-form-header">
              <h2>Request a Specialized Proposal</h2>
              <p>Fill out the form below to receive a customized growth roadmap for <strong>{service.title}</strong>, calibrated specifically for your brand.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="contact-form" style={{ maxWidth: "100%" }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Vikram Adiga"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. name@brand.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company / Brand Name</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. BoldFit India"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Tell us about your brand goals & budget</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={`What metrics or conversion improvements are you aiming for in your ${service.title} campaigns?`}
                />
              </div>

              {formResponse && (
                <div className={`form-feedback ${formResponse.success ? "success" : "error"}`} style={{
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  backgroundColor: formResponse.success ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                  color: formResponse.success ? "#27ae60" : "#c0392b",
                  border: `1px solid ${formResponse.success ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.2)"}`
                }}>
                  {formResponse.message}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary w-full" 
                disabled={formLoading}
                style={{ justifyContent: "center" }}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Submitting Blueprint Request...
                  </>
                ) : (
                  <>
                    Get Free {service.title} Strategy Proposal <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. Other Services suggestions at the bottom */}
      <section className="other-services-suggestions">
        <div className="container">
          <div className="other-services-header">
            <div>
              <span className="section-tag" style={{ color: "var(--primary-gold)" }}>More Channels</span>
              <h3>Explore Other Capabilities</h3>
            </div>
            <Link to="/services" className="btn-primary" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "var(--color-white)", border: "1px solid rgba(255,255,255,0.15)" }}>
              All Services <ArrowRight size={16} />
            </Link>
          </div>

          <div className="other-services-grid">
            {suggestions.map((sug) => {
              const SugIcon = IconMap[sug.iconName] || Sparkles;
              return (
                <Link key={sug.id} to={`/services/${sug.id}`} className="suggestion-card">
                  <div className="suggestion-header">
                    <div className="suggestion-icon">
                      <SugIcon size={20} />
                    </div>
                    <h4 className="suggestion-title">{sug.title}</h4>
                  </div>
                  <p className="suggestion-desc">{sug.description}</p>
                  <span className="suggestion-link">
                    Explore Setup <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
