import '../styles/StatCard.css';

const StatCard = ({ label, value, icon, accent }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent || ''}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
