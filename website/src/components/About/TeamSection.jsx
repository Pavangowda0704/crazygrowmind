import { Linkedin, Twitter, Mail } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

/**
 * TeamSection component renders the team members roster.
 * It handles the loading/skeleton state and maps over active team profiles.
 * 
 * @param {Object} props
 * @param {Array} props.team - Array of database team profiles fetched from the API layer
 * @param {boolean} props.isLoading - Signifies if the database API query is still executing
 */
export default function TeamSection({ team, isLoading }) {
  return (
    <section className="team-section">
      <div className="container">
        {/* Section Header */}
        <ScrollReveal variant="fade-up" className="section-header">
          <span className="section-tag">The Crew</span>
          <h2 className="section-title">Meet Our Creative Architects</h2>
          <p className="section-desc">The growth marketers, visual engineers, and internet natives driving campaigns daily.</p>
        </ScrollReveal>

        {isLoading ? (
          /* Loading indication while fetching active crew roster */
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Retrieving active crew roster...</p>
          </div>
        ) : (
          /* Staggered grid mapping over team members */
          <div className="team-grid">
            {team.map((member, index) => (
              <ScrollReveal
                key={member.id}
                variant="fade-up"
                delay={index * 0.1}
                className="team-card"
                id={`team-card-${member.id}`}
              >
                {/* Crew Member Photo Banner */}
                <div className="team-image-wrapper">
                  <img src={member.image} alt={member.name} referrerPolicy="no-referrer" />
                </div>
                
                {/* Crew Member Metadata & Bios */}
                <div className="team-content">
                  <span className="team-role">{member.role}</span>
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-bio">{member.bio}</p>
                  
                  {/* Crew Member Professional Social Links */}
                  <div className="team-socials">
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="team-social-link" aria-label="LinkedIn">
                        <Linkedin size={18} />
                      </a>
                    )}
                    {member.socials.twitter && (
                      <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="team-social-link" aria-label="Twitter">
                        <Twitter size={18} />
                      </a>
                    )}
                    {member.socials.email && (
                      <a href={`mailto:${member.socials.email}`} className="team-social-link" aria-label="Email">
                        <Mail size={18} />
                      </a>
                    )}
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
