import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

/**
 * ContactForm component renders the interactive strategy request form.
 * It manages success messages, loading spinners, validation errors, and input fields.
 *
 * @param {Object} props
 * @param {Object} props.formData - Controlled object containing name, email, phone, service, message
 * @param {boolean} props.isLoading - Signifies active API processing state
 * @param {boolean} props.isSubmitted - True if the server responded with a success response
 * @param {string} props.statusMessage - Success message returned by the server
 * @param {string} props.errorMsg - Error description if validation or request fails
 * @param {Array<string>} props.availableServices - Roster of services to display in the dropdown selection
 * @param {Function} props.onChange - Event handler for all input updates
 * @param {Function} props.onSubmit - Action handler for form submit triggers
 * @param {Function} props.onReset - Resets isSubmitted state back to normal form edit
 */
export default function ContactForm({
  formData,
  isLoading,
  isSubmitted,
  statusMessage,
  errorMsg,
  availableServices,
  onChange,
  onSubmit,
  onReset
}) {
  return (
    <div className="contact-form-container" id="contact-form-box">
      {isSubmitted ? (
        /* Success Screen State - shown once successfully registered in DB */
        <div className="success-card">
          <div className="success-icon-container">
            <CheckCircle2 size={36} />
          </div>
          <h3>Inquiry Successfully Submitted!</h3>
          <p>{statusMessage}</p>
          <button 
            className="btn-primary" 
            onClick={onReset}
            style={{ marginTop: "10px" }}
            id="reset-form-btn"
          >
            Submit Another Consultation Request
          </button>
        </div>
      ) : (
        /* Active Lead Form State */
        <form onSubmit={onSubmit} id="agency-contact-form">
          <h2 className="contact-form-title">Consultation Pitch</h2>
          <p className="contact-form-subtitle">Fill out this brief context pitch, and we'll schedule a custom Google Meet audit.</p>
          
          {/* Validation Failure Indicator Banner */}
          {errorMsg && (
            <div style={{ color: "red", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", marginBottom: "15px" }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Rows: User Name & Email */}
          <div className="form-group-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Your Name *</label>
              <input
                type="text"
                className="form-input"
                id="contact-name"
                name="name"
                placeholder="e.g. Vikram Sharma"
                value={formData.name}
                onChange={onChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email Address *</label>
              <input
                type="email"
                className="form-input"
                id="contact-email"
                name="email"
                placeholder="e.g. vikram@yourbrand.com"
                value={formData.email}
                onChange={onChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Form Rows: Phone/WhatsApp & Selected Service Option */}
          <div className="form-group-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-phone">Phone / WhatsApp *</label>
              <input
                type="tel"
                className="form-input"
                id="contact-phone"
                name="phone"
                placeholder="e.g. +91 6360357896"
                value={formData.phone}
                onChange={onChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-service">Preferred Growth Service</label>
              <select
                className="form-select"
                id="contact-service"
                name="service"
                value={formData.service}
                onChange={onChange}
                disabled={isLoading}
              >
                {availableServices.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Message: Brand Description/Pitch Context */}
          <div className="form-group">
            <label className="form-label" htmlFor="contact-message">Tell Us About Your Brand & Goals *</label>
            <textarea
              className="form-textarea"
              id="contact-message"
              name="message"
              placeholder="Describe your current marketing challenges, ad budget parameters, and what you expect to achieve with CrazyGrowMind..."
              value={formData.message}
              onChange={onChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Action Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isLoading}
            id="form-submit-button"
          >
            {isLoading ? "Submitting Secure Pitch..." : "Book Free Marketing & Design Consultation"} <ArrowRight size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
