/**
 * Unified Agency API Layer with Simulated Latency
 * 
 * This file acts as the primary data orchestrator for CrazyGrowMind Studio.
 * To enable clean maintenance and quick changes by client request:
 * - All services data have been modularized into separate files under `/src/data/services/`
 * - All other sections (portfolio, testimonials, team, faqs) are imported from `/src/data/`
 * 
 * No structural code needs to change when adding or deleting services;
 * simply update the records in `/src/data/services/index.js`.
 */

import SERVICES_DATA_IMPORT from "../data/services";
import PORTFOLIO_DATA_IMPORT from "../data/portfolio";
import TESTIMONIALS_DATA_IMPORT from "../data/testimonials";
import TEAM_DATA_IMPORT from "../data/team";
import FAQS_DATA_IMPORT from "../data/faqs";

// Export as matching named constants for full backward compatibility
export const SERVICES_DATA = SERVICES_DATA_IMPORT;
export const PORTFOLIO_DATA = PORTFOLIO_DATA_IMPORT;
export const TESTIMONIALS_DATA = TESTIMONIALS_DATA_IMPORT;
export const TEAM_DATA = TEAM_DATA_IMPORT;
export const FAQS_DATA = FAQS_DATA_IMPORT;

// Helper to simulate API Latency for fully premium, asynchronous feeling in UI loading states
const simulateLatency = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 450); // Fluid 450ms dynamic loading delay
  });
};

// API Client Class wrapping database-ready simulated endpoints
export const agencyApi = {
  getServices: async () => {
    return simulateLatency(SERVICES_DATA);
  },
  
  getServiceById: async (id) => {
    const service = SERVICES_DATA.find((s) => s.id === id);
    return simulateLatency(service);
  },
  
  getPortfolio: async () => {
    return simulateLatency(PORTFOLIO_DATA);
  },
  
  getProjectById: async (id) => {
    const project = PORTFOLIO_DATA.find((p) => p.id === id);
    return simulateLatency(project);
  },
  
  getTestimonials: async () => {
    return simulateLatency(TESTIMONIALS_DATA);
  },
  
  getFaqs: async () => {
    return simulateLatency(FAQS_DATA);
  },
  
  getTeam: async () => {
    return simulateLatency(TEAM_DATA);
  },
  
  submitContactForm: async (data) => {
    console.log("POST /api/contact - Received submission:", data);
    return simulateLatency({
      success: true,
      message: `Thank you, ${data.name}! Your consultation request for ${data.service} has been successfully submitted to CrazyGrowMind Studio. Our team will contact you within 4 hours.`
    });
  },
  
  submitLead: async (data) => {
    console.log("POST /api/leads - Received newsletter sign-up:", data);
    return simulateLatency({
      success: true,
      message: "Success! You have been subscribed to our weekly Marketing & Creative Intel reports."
    });
  }
};
