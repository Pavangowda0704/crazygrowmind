import { Link } from "react-router-dom";
import { AlertOctagon, Home } from "lucide-react";
import "../styles/pages/NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-wrapper">
      <div className="container" style={{ display: "flex", justifyContent: "center" }}>
        <div className="notfound-card" id="notfound-panel">
          <AlertOctagon size={48} className="text-gold" style={{ color: "var(--primary-gold)" }} />
          <div className="notfound-code">404</div>
          <h2 className="notfound-title">Creative Space Not Found</h2>
          <p className="notfound-desc">
            The campaign page or growth resource you are searching for does not exist, has been archived, or is currently being calibrated by our architects.
          </p>
          <div style={{ marginTop: "10px" }}>
            <Link to="/" className="btn-primary" id="notfound-back-home">
              <Home size={16} /> Return to Home Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
