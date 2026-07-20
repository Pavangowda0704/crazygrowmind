import { useState, useEffect } from "react";
import AboutHero from "../components/About/AboutHero";
import StorySection from "../components/About/StorySection";
import MvSection from "../components/About/MvSection";
import ValuesSection from "../components/About/ValuesSection";
import TeamSection from "../components/About/TeamSection";
import AboutCta from "../components/About/AboutCta";
import { agencyApi } from "../utils/api";
import "../styles/pages/About.css";

/**
 * About Page Component.
 * This is the high-level container for the About page.
 * It queries team data from the database/API layer and delegates rendering 
 * to clean, self-contained sub-components under src/components/About/*.
 */
export default function About() {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the active crew roster from the database/API module on page mount
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        const teamRes = await agencyApi.getTeam();
        setTeam(teamRes);
      } catch (err) {
        console.error("Failed to load team data in container:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, []);

  return (
    <div className="about-wrapper">
      {/* 1. Header Hero Banner */}
      <AboutHero />

      {/* 2. Brand Origin & Founding Narrative */}
      <StorySection />

      {/* 3. Core Direction Mission & Vision Bento Cards */}
      <MvSection />

      {/* 4. Strategic Tenets / Core Agency Values */}
      <ValuesSection />

      {/* 5. Team Directory Profiles Grid */}
      <TeamSection team={team} isLoading={isLoading} />

      {/* 6. Contact Footer Pitch Call To Action */}
      <AboutCta />
    </div>
  );
}
