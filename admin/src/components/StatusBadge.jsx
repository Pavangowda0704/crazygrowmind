import '../styles/StatusBadge.css';

const colorMap = {
  New: 'blue', Contacted: 'blue', Qualified: 'gold', 'Proposal Sent': 'gold',
  Negotiation: 'gold', Won: 'green', Lost: 'red',
  Active: 'green', Inactive: 'red',
  Draft: 'gray', Sent: 'blue', 'Partially Paid': 'gold', Paid: 'green', Overdue: 'red', Cancelled: 'red',
};

const StatusBadge = ({ status }) => {
  const color = colorMap[status] || 'gray';
  return <span className={`status-badge badge-${color}`}>{status}</span>;
};

export default StatusBadge;
