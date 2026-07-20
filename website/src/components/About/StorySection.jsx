import ScrollReveal from "../ScrollReveal";
import founderStoryImg from "../../assets/images/misc/founders-story.jpg";
/**
 * StorySection component displays the founding story and geographic roots
 * of CrazyGrowMind Studio, paired with an evocative creative workspace photo.
 */
export default function StorySection() {
  return (
    <section className="story-section">
      <div className="container story-grid">
        {/* Left Side: Creative high-quality image of team/office workspace */}
        <ScrollReveal variant="fade-right" className="story-image">
          <img
            src={founderStoryImg}
            alt="CrazyGrowMind founders brainstorming in Bangalore office"
           
          />
        </ScrollReveal>

        {/* Right Side: Narrative copy outlining company philosophy and client segments */}
        <ScrollReveal variant="fade-left" className="story-content">
          <span className="section-tag">Our Genesis</span>
          <h2 className="section-title">Born in Indiranagar, Scaling Across India</h2>
          
          <p>
            CrazyGrowMind Studio was established with a singular, disruptive thesis: <strong>traditional advertising models in India are slow, bloated, and disconnected from contemporary internet culture.</strong>
          </p>
          <p>
            Founded by Vikram S. Adiga in Bengaluru, the studio set out to build a streamlined, partner-first collective. We replaced sterile corporate procedures with high-humor social intelligence, and substituted template designs with premium, bespoke visuals.
          </p>
          <p>
            Today, we serve high-growth consumer startups, direct-to-consumer (D2C) brands, boutique lifestyle lounges, and retail giants. We bridge the gap between pure viral attention and structural performance metrics.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
