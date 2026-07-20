import { MessageCircle } from "lucide-react";
import "../styles/components/WhatsAppButton.css";

export default function WhatsAppButton() {
  const phoneNumber = "916360357896"; // India country code +91
  const text = encodeURIComponent(
    "Hi CrazyGrowMind Studio, I visited your website and would love to schedule a creative marketing consultation for my brand!"
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Contact us on WhatsApp"
      id="whatsapp-floating-action"
    >
      <div className="whatsapp-pulse" />
      <MessageCircle size={24} />
      <span className="whatsapp-tooltip">Chat with us on WhatsApp</span>
    </a>
  );
}
