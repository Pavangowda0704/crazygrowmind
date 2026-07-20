import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>
      <div className="topbar-spacer" />
      <div className="user-menu">
        <button className="user-btn" onClick={() => setMenuOpen((v) => !v)}>
          <span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </button>
        {menuOpen && (
          <div className="user-dropdown">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
