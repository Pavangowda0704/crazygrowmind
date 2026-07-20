import '../styles/Pagination.css';

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      items.push(i);
    } else if (items[items.length - 1] !== '...') {
      items.push('...');
    }
  }

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {items.map((it, idx) =>
        it === '...' ? (
          <span key={`dots-${idx}`} className="dots">
            …
          </span>
        ) : (
          <button key={it} className={it === page ? 'active' : ''} onClick={() => onChange(it)}>
            {it}
          </button>
        )
      )}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
