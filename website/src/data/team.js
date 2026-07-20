import vikramImg from "../assets/images/team/vikram-adiga.jpg";
import priyankaImg from "../assets/images/team/priyanka-sharma.jpg";
import nikhilImg from "../assets/images/team/nikhil-deshmukh.jpg";

/**
 * TEAM MEMBERS DATA
 * 
 * To EDIT, ADD, or REMOVE team members:
 * Simply update this list of objects.
 */

export const TEAM_DATA = [
  {
    id: "team-1",
    name: "Vikram S. Adiga",
    role: "Founder & Creative Director",
    bio: "Visionary strategist with 12+ years pioneering viral social campaigns and creative directions for elite consumer brands in India.",
    image: vikramImg,
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "vikram@crazygrowmind.com"
    }
  },
  {
    id: "team-2",
    name: "Priyanka Sharma",
    role: "Head of Growth & Performance",
    bio: "Performance marketer obsessed with CPA optimization, data frameworks, and scaling Google and Meta channels profitably.",
    image: priyankaImg,
    socials: {
      linkedin: "https://linkedin.com",
      email: "priyanka@crazygrowmind.com"
    }
  },
  {
    id: "team-3",
    name: "Nikhil Deshmukh",
    role: "Lead Creative Designer & Meme Strategist",
    bio: "Cultural native who lives on the internet, transforming trending cultural memes into high-ROI corporate campaigns.",
    image: nikhilImg,
    socials: {
      twitter: "https://twitter.com",
      email: "nikhil@crazygrowmind.com"
    }
  }
];

export default TEAM_DATA;
