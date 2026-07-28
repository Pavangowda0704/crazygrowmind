import { Search, X } from 'lucide-react';
import '../styles/SearchFilterBar.css';

const SearchFilterBar = ({ search, onSearchChange, filters, children }) => {
  return (
    <div className="search-filter-bar">
      <div className="search-input-wrap">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button type="button" className="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="filter-slot">{children}</div>
    </div>
  );
};

export default SearchFilterBar;