import { ChevronDown } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function ServicesFaq({ faqs, activeFaqId, onToggleFaq }) {
  return (
    <section className="faq-section">
      <div className="container">
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">Intelligence Base</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Clear, direct answers about agency deliverables, campaign operations, and growth expectations.</p>
        </ScrollReveal>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <ScrollReveal 
              key={faq.id} 
              variant="fade-up" 
              delay={index * 0.08}
              className={`faq-item ${activeFaqId === faq.id ? "active" : ""}`}
              id={`faq-item-${faq.id}`}
            >
              <button 
                className="faq-question" 
                onClick={() => onToggleFaq(faq.id)}
                aria-expanded={activeFaqId === faq.id}
                id={`faq-btn-${faq.id}`}
              >
                <span>{faq.question}</span>
                <div className="faq-icon-wrapper">
                  <ChevronDown size={18} />
                </div>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
