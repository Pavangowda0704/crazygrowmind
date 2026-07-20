import ScrollReveal from "../ScrollReveal";

/**
 * PortfolioTabs renders the category filter tab bar on the Portfolio page.
 * 
 * @param {Object} props
 * @param {Array<string>} props.categories - List of active category strings
 * @param {string} props.activeCategory - Currently selected active filter category
 * @param {Function} props.onSelectCategory - Callback triggered when tab button is clicked
 */
export default function PortfolioTabs({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="container">
      <ScrollReveal variant="fade-up" className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => onSelectCategory(cat)}
            id={`portfolio-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {cat}
          </button>
        ))}
      </ScrollReveal>
    </div>
  );
}
