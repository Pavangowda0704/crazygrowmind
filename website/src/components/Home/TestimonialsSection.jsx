import { Star } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

export default function TestimonialsSection({ testimonials, isLoading }) {
  return (
    <section className="home-testimonials">
      <div className="container">
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">Client Feedback</span>
          <h2 className="section-title">What Founders Say About Us</h2>
          <p className="section-desc">Real, compounding business growth validated by visionary local and national business leaders.</p>
        </ScrollReveal>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Retrieving client endorsements...</p>
          </div>
        ) : (
          <div className="testimonial-slider">
            {testimonials.map((test, index) => (
              <ScrollReveal
                key={test.id}
                variant="fade-up"
                delay={index * 0.15}
                className="testimonial-card"
              >
                <div className="testimonial-rating">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="var(--primary-gold)" stroke="none" />
                  ))}
                </div>
                <p className="testimonial-text">"{test.text}"</p>
                <div className="testimonial-author">
                  <img src={test.avatar} alt={test.name} className="testimonial-avatar" referrerPolicy="no-referrer" />
                  <div className="testimonial-author-info">
                    <h4>{test.name}</h4>
                    <p>{test.role}, {test.company}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
