import { useState, useEffect } from "react";
import PortfolioHero from "../components/Portfolio/PortfolioHero";
import PortfolioTabs from "../components/Portfolio/PortfolioTabs";
import PortfolioGrid from "../components/Portfolio/PortfolioGrid";
import PortfolioModal from "../components/Portfolio/PortfolioModal";
import PortfolioCta from "../components/Portfolio/PortfolioCta";
import { agencyApi } from "../utils/api";
import "../styles/pages/Portfolio.css";

// Global constant defining tab options to prevent unnecessary recalculations
const CATEGORIES = ["All", "Social Media", "Store Promotion", "SEO", "Meme Marketing", "Branding"];

/**
 * Portfolio Page Container.
 * Manages fetching project data from the database/API layer, filters active 
 * tabs, and controls showing/closing the case study details popup.
 */
export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load the project list from the database/API module on component mount
  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const response = await agencyApi.getPortfolio();
        setProjects(response);
      } catch (err) {
        console.error("Failed to load portfolio database in container:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  // Open the project details modal and lock body scrolling
  const handleOpenProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close the active project details modal and unlock body scrolling
  const handleCloseProject = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  // Filter projects based on the active tab category selection
  const filteredProjects = projects.filter(
    (p) => activeCategory === "All" || p.category === activeCategory
  );

  return (
    <div className="portfolio-page-wrapper">
      {/* 1. Header Hero Banner */}
      <PortfolioHero />

      {/* 2. Interactive Category Filter Tabs */}
      <PortfolioTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 3. Filtered Case Studies Grid */}
      <PortfolioGrid
        projects={filteredProjects}
        isLoading={isLoading}
        onOpenProject={handleOpenProject}
      />

      {/* 4. Detailed Case Study Overlay Modal Drawer */}
      <PortfolioModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseProject}
      />

      {/* 5. Strategy Audit Call To Action Banner */}
      <PortfolioCta />
    </div>
  );
}
