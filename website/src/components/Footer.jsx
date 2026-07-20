import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send, Mail, Phone, Clock, MapPin } from "lucide-react";
import { agencyApi } from "../utils/api";
import Logo from "./Logo";
import "../styles/components/Footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await agencyApi.submitLead({ email });
      if (response.success) {
        setStatus(response.message);
        setEmail("");
      } else {
        setStatus("Subscription failed. Please try again.");
      }
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="footer" id="agency-footer-section">
      <div className="container">
        <div className="footer-top">
          {/* Column 1: Brand & Socials */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link" id="footer-logo">
              <Logo layout="horizontal" height={72} className="footer-logo-custom" />
            </Link>
            <p className="footer-tagline">
              India's premier digital marketing & creative agency. We build viral momentum, optimize search visibility, and design luxury user experiences.
            </p>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-title">Agency</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/services" className="footer-link">Our Services</Link></li>
              <li><Link to="/portfolio" className="footer-link">Portfolio</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-links" style={{ color: "var(--color-light-gray)", fontSize: "0.95rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={16} className="text-gold" style={{ color: "var(--primary-gold)" }} />
                <span>hello@crazygrowmind.com</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={16} className="text-gold" style={{ color: "var(--primary-gold)" }} />
                <span>+91 6360357896</span>
              </li>
              <li style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <MapPin size={16} className="text-gold" style={{ color: "var(--primary-gold)", marginTop: "4px" }} />
                <span>Indiranagar, Bengaluru,<br />Karnataka, India</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={16} className="text-gold" style={{ color: "var(--primary-gold)" }} />
                <span>Mon - Sat: 10 AM - 7 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="footer-newsletter">
            <h4 className="footer-title">Newsletter</h4>
            <p>Subscribe to receive viral marketing campaigns, design insights, and corporate growth strategies.</p>
            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="footer-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <button type="submit" className="footer-btn" aria-label="Subscribe" disabled={isLoading} id="footer-newsletter-submit">
                <Send size={18} />
              </button>
            </form>
            {status && <div className="footer-newsletter-success">{status}</div>}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CrazyGrowMind Studio. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy" className="footer-link" style={{ fontSize: "0.85rem" }}>Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="footer-link" style={{ fontSize: "0.85rem" }}>Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}