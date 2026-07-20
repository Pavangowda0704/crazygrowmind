import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
    <h1 style={{ fontSize: 60, margin: 0, color: '#c9a227' }}>404</h1>
    <p style={{ color: '#555' }}>Page not found</p>
    <Link to="/dashboard" style={{ color: '#c9a227', fontWeight: 600 }}>Go to Dashboard</Link>
  </div>
);

export default NotFound;
