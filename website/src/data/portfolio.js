import boldfitImg from "../assets/images/portfolio/boldfit-social-campaign.jpg";
import brewHavenImg from "../assets/images/portfolio/brew-haven-cafe-launch.jpg";
import rupiflowImg from "../assets/images/portfolio/rupiflow-seo.jpg";
import snackbiteImg from "../assets/images/portfolio/snackbite-meme-campaign.jpg";
import elysianImg from "../assets/images/portfolio/elysian-luxe-rebrand.jpg";



/**
 * PORTFOLIO CASES DATA
 * 
 * To EDIT, ADD, or REMOVE portfolio case studies:
 * Simply update this list of objects. Each project should have:
 * - id: String (unique identifier)
 * - title: String (headline title)
 * - serviceId: String (associated service id)
 * - client: String (name of the client brand)
 * - category: String (for filtering tabs)
 * - image: String (unsplash URL or asset path)
 * - description: String (short preview description)
 * - challenge: String (paragraph defining client challenge)
 * - solution: String (paragraph defining agency solution)
 * - results: Array of { metric: string, value: string }
 */

export const PORTFOLIO_DATA = [
  {
    id: "boldfit-social-campaign",
    title: "BoldFit: Breaking Fitness Standards",
    serviceId: "social-media-marketing",
    client: "BoldFit India",
    category: "Social Media",
    image: boldfitImg,
    description: "An integrated digital marketing drive focused on showcasing real Indian fitness journeys, driving massive brand warmth and engagement.",
    challenge: "Fitness marketing in India was heavily dominated by unrealistic professional bodybuilder aesthetics, making everyday enthusiasts feel disconnected.",
    solution: "We launched 'Everyday Athlete' campaigns featuring diverse corporate workers, homemakers, and student creators, accompanied by humorous, relatable fitness memes and routine videos.",
    results: [
      { metric: "Organic Reach", value: "4.5M+" },
      { metric: "Engagement Rate", value: "+182%" },
      { metric: "Lead Conversion", value: "8.4%" }
    ]
  },
  {
    id: "brew-haven-cafe-launch",
    title: "Brew Haven Cafe: Hyperlocal Store Launch",
    serviceId: "store-promotion",
    client: "Brew Haven Bangalore",
    category: "Store Promotion",
    image: brewHavenImg,
    description: "Hyperlocal geofenced campaign backed by food micro-influencers to drive launch week foot-traffic for a premium artisanal coffee lounge.",
    challenge: "Standing out in Bangalore's heavily saturated cafe landscape with a highly localized customer radius of just 5 kilometers.",
    solution: "We deployed targeted Meta Ads promoting an exclusive 'Secret Brew Invite' with custom map routing, coupled with 15 local food vlogger reviews on Instagram Reels.",
    results: [
      { metric: "Opening Weekend Foot-traffic", value: "1,200+ Guests" },
      { metric: "UGC Stories Created", value: "450+" },
      { metric: "Google Maps Rating", value: "4.8/5" }
    ]
  },
  {
    id: "fintech-seo-dominance",
    title: "RupiFlow: Organic SEO Authority",
    serviceId: "seo",
    client: "RupiFlow Fintech",
    category: "SEO",
    image: rupiflowImg,
    description: "Rebuilding content mapping and technical structure to secure highly lucrative, high-intent keywords in the personal finance sector.",
    challenge: "Competing against massive banking portals for organic search positions on terms like 'Best digital saving plans' and 'tax-saving mutual funds'.",
    solution: "We executed technical site speed recovery (under 1.5s Load Time) and deployed 45 high-authority expert guides answering local financial queries with clear interactive calculator hooks.",
    results: [
      { metric: "Monthly Organic Traffic", value: "+320k" },
      { metric: "Keyword Rankings (Top 3)", value: "78 terms" },
      { metric: "Customer Signups via Blog", value: "14,500+" }
    ]
  },
  {
    id: "zomato-style-meme-takeover",
    title: "SnackBite Meme Virality Campaign",
    serviceId: "meme-marketing",
    client: "SnackBite Foods",
    category: "Meme Marketing",
    image: snackbiteImg,
    description: "Capitalizing on fast-paced internet templates to position SnackBite as the default late-night snack for corporate professionals.",
    challenge: "FMCG advertising is expensive and often ignored. The brand needed immediate awareness on a lean, organic-first budget.",
    solution: "We created a coordinated meme deployment network utilizing local Indian relatable themes (IT worker struggles, mid-day tea craving) and integrated the snack subtle into pop-culture templates.",
    results: [
      { metric: "Social Impressions", value: "12M+" },
      { metric: "Saves & Shares", value: "250k+" },
      { metric: "E-Commerce Orders", value: "+45%" }
    ]
  },
  {
    id: "vogue-visual-rebrand",
    title: "Elysian Luxe: Rebranding and Digital Flagship",
    serviceId: "branding",
    client: "Elysian Jewelers",
    category: "Branding",
    image: elysianImg,
    description: "A luxury visual reboot, style guide, and ultra-premium modern react experience for a boutique custom gold jewelry brand.",
    challenge: "The brand possessed stellar legacy products but looked outdated online, failing to attract younger, high-net-worth millennial buyers.",
    solution: "We developed a gorgeous gold-accented typography grid, custom lifestyle video guidelines, and built a blazing fast, minimalist React storefront focusing on product craftsmanship.",
    results: [
      { metric: "Average Order Value (AOV)", value: "+54%" },
      { metric: "Web Engagement", value: "4m 20s avg" },
      { metric: "Inquiries Generated", value: "1,800+/mo" }
    ]
  }
];

export default PORTFOLIO_DATA;
