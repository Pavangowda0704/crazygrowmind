import { MapPin, Mail, Phone, Clock, MessageCircle } from "lucide-react";

/**
 * ContactSidebar component lists physical and digital access coordinates,
 * provides a click-to-chat WhatsApp button, and embeds a Google Map iframe of Indiranagar, Bengaluru.
 *
 * @param {Object} props
 * @param {Function} props.onWhatsAppClick - Callback to initiate standard WhatsApp redirect
 */
export default function ContactSidebar({ onWhatsAppClick }) {
  return (
    <div className="contact-details-sidebar">
      {/* 1. Agency Coordinates Info Box */}
      <div className="detail-block">
        <h3 className="detail-block-title">Agency Coordinates</h3>
        
        {/* Physical Office Address */}
        <div className="detail-item-row">
          <MapPin size={20} />
          <div>
            <strong>Bengaluru Head Office</strong>
            <p>12, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India</p>
          </div>
        </div>

        {/* Primary Contact Email */}
        <div className="detail-item-row">
          <Mail size={18} />
          <div>
            <strong>Primary Inquiries</strong>
            <p>hello@crazygrowmind.com</p>
          </div>
        </div>

        {/* Core Direct Mobile Line */}
        <div className="detail-item-row">
          <Phone size={18} />
          <div>
            <strong>Direct Consulting Line</strong>
            <p>+91 6360357896</p>
          </div>
        </div>

        {/* Weekly Business Hours */}
        <div className="detail-item-row">
          <Clock size={18} />
          <div>
            <strong>Operations Hours</strong>
            <p>Monday - Saturday: 10:00 AM - 7:00 PM IST (Sunday closed)</p>
          </div>
        </div>
      </div>

      {/* 2. Direct Instant WhatsApp Access Button */}
      <button 
        className="contact-whatsapp-btn" 
        onClick={onWhatsAppClick}
        id="direct-whatsapp-cta-button"
      >
        <MessageCircle size={22} /> Instant WhatsApp Consulting
      </button>

      {/* 3. Embedded Google Map (Indiranagar, Bengaluru) */}
      <div className="map-container" id="indiranagar-google-map">
        <iframe
          title="CrazyGrowMind Bengaluru Studio Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.97371987515!2d77.64057867566974!3d12.97353928734208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13f044bb4659%3A0xe53ef0a22a36d935!2s100%20Feet%20Rd%2C%20Indiranagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
