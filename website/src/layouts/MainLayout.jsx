import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import WhatsAppButton from "../components/WhatsAppButton";
import "../styles/layouts/MainLayout.css";

/**
 * MainLayout handles the global shell of the application.
 * Ensures consistent page margins, sticky offset handling, and global floating features.
 */
export default function MainLayout() {
  return (
    <div className="main-layout-wrapper" id="site-main-layout">
      {/* Reset window scroll to top on routing */}
      <ScrollToTop />

      {/* Persistent Sticky Navbar */}
      <Navbar />

      {/* Main content viewport containing child routes */}
      <main className="main-layout-content" id="site-main-content">
        <div className="main-layout-page-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Footer Section */}
      <Footer />

      {/* Sticky Floating CTA Tools */}
      <WhatsAppButton />
    </div>
  );
}
