import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";

/**
 * PortfolioModal renders the detailed popup drawer for a clicked case study.
 * It outlines the project's real-world challenge, design solution, metrics, 
 * and includes a fast click-through to inquiry.
 *
 * @param {Object} props
 * @param {Object} props.project - Selected project profile object, or null
 * @param {boolean} props.isOpen - Signifies if the modal is actively visible
 * @param {Function} props.onClose - Action handler to close the active modal and restore page scroll
 */
export default function PortfolioModal({ project, isOpen, onClose }) {
  if (!project) return null;

  return (
    <div 
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
      id="case-study-modal-overlay"
    >
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent accidental backdrop close
        id="case-study-modal-container"
      >
        {/* Floating circular Close button */}
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close Case Study Details"
          id="close-modal-btn"
        >
          <X size={20} />
        </button>

        {/* Modal Header Banner Image with Dynamic Overlays */}
        <div className="modal-hero-image">
          <img src={project.image} alt={project.title} referrerPolicy="no-referrer" />
          <div className="modal-hero-overlay">
            <span className="modal-hero-client">{project.client}</span>
            <h2 className="modal-hero-title">{project.title}</h2>
          </div>
        </div>

        {/* Modal Text Grid */}
        <div className="modal-body">
          <div className="modal-grid">
            
            {/* Left Block: Full descriptive texts of challenge and strategic answer */}
            <div className="modal-content-block">
              <div className="modal-text-group">
                <h3>The Challenge</h3>
                <p>{project.challenge}</p>
              </div>

              <div className="modal-text-group" style={{ marginTop: "16px" }}>
                <h3>Our Creative Strategy & Solution</h3>
                <p>{project.solution}</p>
              </div>
            </div>

            {/* Right Block: Metrics details & instant conversion CTAs */}
            <div className="modal-sidebar">
              <h4 className="modal-sidebar-title">Campaign Results</h4>
              
              <div className="modal-results-list">
                {project.results.map((res, index) => (
                  <div key={index} className="modal-result-item">
                    <span className="modal-result-lbl">{res.metric}</span>
                    <span className="modal-result-val">{res.value}</span>
                  </div>
                ))}
              </div>

              {/* Direct query conversion button */}
              <div style={{ marginTop: "10px" }}>
                <Link
                  to={`/contact?service=${encodeURIComponent(project.client)} Campaign Success`}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={onClose}
                  id="modal-cta-button"
                >
                  Inquire About Similar Success <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
