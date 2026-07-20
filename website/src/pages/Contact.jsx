import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ContactHero from "../components/Contact/ContactHero";
import ContactForm from "../components/Contact/ContactForm";
import ContactSidebar from "../components/Contact/ContactSidebar";
import { agencyApi } from "../utils/api";
import "../styles/pages/Contact.css";

// Available services configured globally to prevent unnecessary re-allocations
const AVAILABLE_SERVICES = [
  "Digital Marketing",
  "Social Media Marketing",
  "Influencer Marketing",
  "Content Creation",
  "Meme Marketing",
  "Troll Marketing",
  "Branding",
  "Graphic Design",
  "SEO",
  "Google Ads",
  "Meta Ads",
  "Website Development",
  "Photography",
  "Video Editing",
  "Store Promotion",
  "Offline Marketing"
];

/**
 * Contact Page Container.
 * Manages form state, query parameter extraction, field validation, 
 * and API submission calls, then orchestrates child presentation components.
 */
export default function Contact() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: AVAILABLE_SERVICES[0], // Default service selection
    message: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check if a pre-selected service was supplied via URL search queries (e.g. "?service=SEO")
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) {
      const matched = AVAILABLE_SERVICES.find(
        (s) => s.toLowerCase() === serviceParam.toLowerCase()
      );
      if (matched) {
        setFormData((prev) => ({ ...prev, service: matched }));
      }
    }
  }, [searchParams]);

  // Handle value modifications for any of our input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset the success status to allow completing another pitch form
  const handleResetForm = () => {
    setIsSubmitted(false);
  };

  // Handle submit dispatching and form validation checks
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Core input presence checks
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setStatusMessage("");

    try {
      const response = await agencyApi.submitContactForm(formData);
      if (response.success) {
        setStatusMessage(response.message);
        setIsSubmitted(true);
        // Clear inputs upon successful API registration
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: AVAILABLE_SERVICES[0],
          message: ""
        });
      } else {
        setErrorMsg("Failed to submit. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Launch pre-filled WhatsApp conversation with official agency coordinator
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "916360357896";
    const text = encodeURIComponent(
      "Hi CrazyGrowMind Studio, I am looking to initiate a creative/marketing consultation for my brand!"
    );
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="contact-page-wrapper">
      {/* 1. Page Header Hero */}
      <ContactHero />

      {/* 2. Interactive Lead Consultation Grid Section */}
      <section className="contact-section">
        <div className="container contact-grid">
          
          {/* Left Side: Dynamic Consultation Pitch Form */}
          <ContactForm
            formData={formData}
            isLoading={isLoading}
            isSubmitted={isSubmitted}
            statusMessage={statusMessage}
            errorMsg={errorMsg}
            availableServices={AVAILABLE_SERVICES}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={handleResetForm}
          />

          {/* Right Side: Access Coordinates & Embedded Google Map */}
          <ContactSidebar onWhatsAppClick={handleWhatsAppRedirect} />

        </div>
      </section>
    </div>
  );
}
