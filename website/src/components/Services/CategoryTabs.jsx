import ScrollReveal from "../ScrollReveal";

export default function CategoryTabs({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="container">
      <ScrollReveal variant="fade-up" className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => onSelectCategory(cat)}
            id={`filter-tab-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </ScrollReveal>
    </div>
  );
}
