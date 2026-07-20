import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import useScrollPosition from "../../hooks/useScrollPosition";
import Logo from "../Logo";
import "../../styles/components/Navbar.css";

export default function Navbar() {
  const isScrolled = useScrollPosition(50);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <>
      <header className={`navbar ${isScrolled ? "scrolled" : ""}`} id="sticky-header-navigation">
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo-link" id="nav-logo">
            <Logo layout="horizontal" height={72} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className="navbar-menu">
              <li>
                <Link to="/" className={`navbar-link ${isActive("/")}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={`navbar-link ${isActive("/about")}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className={`navbar-link ${isActive("/services")}`}>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className={`navbar-link ${isActive("/portfolio")}`}>
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`navbar-link ${isActive("/contact")}`}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Call to Action Button */}
          <div className="navbar-actions">
            <a href={import.meta.env.VITE_ADMIN_URL || "http://localhost:5173"} className="btn-primary" id="nav-cta">
              Login <ArrowRight size={16} />
            </a>
            
            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation menu"
              id="mobile-nav-open"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-overlay ${isDrawerOpen ? "visible" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile Drawer Container */}
      <div className={`mobile-drawer ${isDrawerOpen ? "open" : ""}`} id="mobile-sidebar-navigation">
        <div className="mobile-drawer-header">
          <Link to="/" className="mobile-drawer-logo-link">
            <Logo layout="horizontal" height={48} className="drawer-logo-white" />
          </Link>
          <button
            className="mobile-drawer-close"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close navigation menu"
            id="mobile-nav-close"
          >
            <X size={26} />
          </button>
        </div>

        <ul className="mobile-drawer-menu">
          <li>
            <Link to="/" className={`mobile-drawer-link ${isActive("/")}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={`mobile-drawer-link ${isActive("/about")}`}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="/services" className={`mobile-drawer-link ${isActive("/services")}`}>
              Services
            </Link>
          </li>
          <li>
            <Link to="/portfolio" className={`mobile-drawer-link ${isActive("/portfolio")}`}>
              Portfolio
            </Link>
          </li>
          <li>
            <Link to="/contact" className={`mobile-drawer-link ${isActive("/contact")}`}>
              Contact Us
            </Link>
          </li>
        </ul>

        <div style={{ marginTop: "auto" }}>
          <a href={import.meta.env.VITE_ADMIN_URL || "http://localhost:5173"} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Login <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </>
  );
}