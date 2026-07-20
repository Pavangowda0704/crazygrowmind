import ScrollReveal from "../ScrollReveal";
import { truncateToWordBoundary } from "../../utils/text";

/**
 * PortfolioGrid component renders a 3-column masonry/grid of project card thumbnails.
 *
 * @param {Object} props
 * @param {Array} props.projects - Filtered list of case study items to show
 * @param {boolean} props.isLoading - Signifies active loading state of database retrieval
 * @param {Function} props.onOpenProject - Callback to open detailed modal for a case study
 */
export default function PortfolioGrid({ projects, isLoading, onOpenProject }) {
  return (
    <section className="gallery-section">
      <div className="container">
        {isLoading ? (
          /* Loading animation state during DB queries */
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <p>Fetching Case Studies from CRM system...</p>
          </div>
        ) : (
          /* Staggered grid showing all filtered projects */
          <div className="grid-3" id="portfolio-grid-container">
            {projects.map((project, index) => (
              <ScrollReveal
                key={project.id}
                variant="fade-up"
                delay={(index % 3) * 0.1}
                className="portfolio-grid-card"
                onClick={() => onOpenProject(project)}
                id={`portfolio-item-${project.id}`}
              >
                {/* Project Card Image & Hover Category Badge */}
                <div className="portfolio-grid-card-image">
                  <img src={project.image} alt={project.title} referrerPolicy="no-referrer" />
                  <span className="portfolio-grid-card-tag">{project.category}</span>
                </div>
                
                {/* Project Card Texts */}
                <div className="portfolio-grid-card-content">
                  <span className="portfolio-grid-card-client">{project.client}</span>
                  <h3 className="portfolio-grid-card-title">{project.title}</h3>
                  <p className="portfolio-grid-card-desc">
                    {truncateToWordBoundary(project.description, 110)}
                  </p>
                  
                  {/* Performance Indicators / Results Badges */}
                  <div className="portfolio-grid-card-results">
                    {project.results.map((res, idx) => (
                      <div key={idx} className="result-badge">
                        <span className="result-badge-val">{res.value}</span>
                        <span className="result-badge-lbl">{res.metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
