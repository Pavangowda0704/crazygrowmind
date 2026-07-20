import '../styles/SearchFilterBar.css';

const SearchFilterBar = ({ search, onSearchChange, filters, children }) => {
  return (
    <div className="search-filter-bar">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      <div className="filter-slot">{children}</div>
    </div>
  );
};

export default SearchFilterBar;
