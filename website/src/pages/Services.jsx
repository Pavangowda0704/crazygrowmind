import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  TrendingUp, Share2, Users, PenTool, Smile, MessageCircle, Sparkles, 
  Palette, Search, MousePointer, Facebook, Code, Camera, Video, 
  MapPin, Award 
} from "lucide-react";
import ServicesHero from "../components/Services/ServicesHero";
import CategoryTabs from "../components/Services/CategoryTabs";
import ServiceShowcase from "../components/Services/ServiceShowcase";
import ServicesGrid from "../components/Services/ServicesGrid";
import ServicesFaq from "../components/Services/ServicesFaq";
import ServicesCta from "../components/Services/ServicesCta";
import { agencyApi } from "../utils/api";
import "../styles/pages/Services.css";

// Dynamic map to map icon strings to Lucide components
const IconMap = {
  TrendingUp, Share2, Users, PenTool, Smile, MessageCircle, Sparkles,
  Palette, Search, MousePointer, Facebook, Code, Camera, Video,
  MapPin, Award
};

const CATEGORIES = ["All", "Strategy", "Creative", "Organic", "Performance", "Production", "Offline"];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFaqId, setActiveFaqId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const showcaseRef = useRef(null);

  // Load services and FAQ data from the api
  useEffect(() => {
    const loadServicesData = async () => {
      try {
        const [servicesRes, faqsRes] = await Promise.all([
          agencyApi.getServices(),
          agencyApi.getFaqs()
        ]);
        setServices(servicesRes);
        setFaqs(faqsRes);

        // Check search params for pre-selected service
        const serviceIdParam = searchParams.get("id");
        if (serviceIdParam) {
          const preSelected = servicesRes.find(s => s.id === serviceIdParam);
          if (preSelected) {
            setSelectedService(preSelected);
            setActiveCategory(preSelected.category);
            return;
          }
        }
        
        // Default select the first service
        if (servicesRes.length > 0) {
          setSelectedService(servicesRes[0]);
        }
      } catch (err) {
        console.error("Failed to load services database:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadServicesData();
  }, [searchParams]);

  // Handle service card click - updates details and scrolls smoothly to showcase
  const handleSelectService = (service) => {
    setSelectedService(service);
    setSearchParams({ id: service.id });
    
    if (showcaseRef.current) {
      showcaseRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    // If we filter, auto-select the first service in that filtered list if available
    const filtered = services.filter(s => category === "All" || s.category === category);
    if (filtered.length > 0) {
      setSelectedService(filtered[0]);
    }
  };

  const toggleFaq = (id) => {
    if (activeFaqId === id) {
      setActiveFaqId(null);
    } else {
      setActiveFaqId(id);
    }
  };

  // Filter services by category tab
  const filteredServices = services.filter(
    (s) => activeCategory === "All" || s.category === activeCategory
  );

  return (
    <div className="services-page-wrapper">
      {/* 1. Services Header Banner */}
      <ServicesHero />

      {/* 2. Primary Category Selector Tab Bar */}
      <CategoryTabs 
        categories={CATEGORIES} 
        activeCategory={activeCategory} 
        onSelectCategory={handleCategoryFilter} 
      />

      {/* 3. Capabilities Main Interaction Section */}
      <section className="services-section">
        <div className="container">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <p>Fetching full capability database from server...</p>
            </div>
          ) : (
            <>
              {/* Service Details Active Focus Showcase Block */}
              <ServiceShowcase 
                selectedService={selectedService} 
                showcaseRef={showcaseRef} 
                IconMap={IconMap} 
              />

              {/* Grid of All Filtered Services */}
              <ServicesGrid 
                filteredServices={filteredServices} 
                selectedService={selectedService} 
                onSelectService={handleSelectService} 
                IconMap={IconMap} 
              />
            </>
          )}
        </div>
      </section>

      {/* 4. Frequently Asked Questions Accordion */}
      <ServicesFaq 
        faqs={faqs} 
        activeFaqId={activeFaqId} 
        onToggleFaq={toggleFaq} 
      />

      {/* 5. Final Contact Call to Action */}
      <ServicesCta />
    </div>
  );
}
