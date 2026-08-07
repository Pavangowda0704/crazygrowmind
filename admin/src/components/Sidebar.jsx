import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Target, Users, Wrench, FileText, CreditCard, TrendingUp, Settings, ShieldCheck,
  Ticket, UserCog, Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Target },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/bookings', label: 'Bookings', icon: Ticket },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/employees', label: 'Employees', icon: UserCog },
  { to: '/employee-payments', label: 'Employee Payments', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ open, onNavigate }) => {
  const { user } = useAuth();
  const visibleLinks = user?.role === 'superadmin' ? [...links, { to: '/users', label: 'Admin Users', icon: ShieldCheck }] : links;

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-gold">Crazy</span>GrowMind
        <div className="brand-sub">Admin Portal</div>
      </div>
      <nav className="sidebar-nav">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon"><link.icon size={17} strokeWidth={2} /></span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
