import { useState, useEffect } from "react";
import { TrendingUp, Award, Zap, Sparkles, Flame, BarChart2 } from "lucide-react";
import Hero from "../components/Hero/Hero";
import StatsSection from "../components/Home/StatsSection";
import AboutPreviewSection from "../components/Home/AboutPreviewSection";
import ServicesPreviewSection from "../components/Home/ServicesPreviewSection";
import WhyChooseSection from "../components/Home/WhyChooseSection";
import ProcessSection from "../components/Home/ProcessSection";
import PortfolioPreviewSection from "../components/Home/PortfolioPreviewSection";
import TestimonialsSection from "../components/Home/TestimonialsSection";
import ContactCtaSection from "../components/Home/ContactCtaSection";
import { agencyApi } from "../utils/api";
import "../styles/pages/Home.css";

// Dynamic map to map icon strings to Lucide components
const IconMap = {
  TrendingUp: TrendingUp,
  Award: Award,
  Zap: Zap,
  Sparkles: Sparkles,
  Flame: Flame,
  BarChart2: BarChart2
};

export default function Home() {
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, portfolioRes, testimonialsRes] = await Promise.all([
          agencyApi.getServices(),
          agencyApi.getPortfolio(),
          agencyApi.getTestimonials()
        ]);
        // Limit to top 6 services and top 3 projects for the home page preview
        setServices(servicesRes.slice(0, 6));
        setProjects(portfolioRes.slice(0, 3));
        setTestimonials(testimonialsRes);
      } catch (err) {
        console.error("Failed to load home page dynamic assets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="home-wrapper">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Company Statistics Section */}
      <StatsSection />

      {/* 3. About Preview Section */}
      <AboutPreviewSection />

      {/* 4. Services Preview Section */}
      <ServicesPreviewSection services={services} isLoading={isLoading} IconMap={IconMap} />

      {/* 5. Why Choose Us Section */}
      <WhyChooseSection />

      {/* 6. Our Process Section */}
      <ProcessSection />

      {/* 7. Portfolio Preview Section */}
      <PortfolioPreviewSection projects={projects} isLoading={isLoading} />

      {/* 8. Testimonials Section */}
      <TestimonialsSection testimonials={testimonials} isLoading={isLoading} />

      {/* 9. Contact CTA Banner */}
      <ContactCtaSection />
    </div>
  );
}
