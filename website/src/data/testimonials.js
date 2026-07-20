import rohanImg from "../assets/images/testimonials/rohan-mehra.jpg";
import ananyaImg from "../assets/images/testimonials/ananya-iyer.jpg";
import karthikImg from "../assets/images/testimonials/karthik-gowda.jpg";


/**
 * TESTIMONIALS DATA
 * 
 * To EDIT, ADD, or REMOVE client testimonials:
 * Simply update this list of objects.
 */

export const TESTIMONIALS_DATA = [
  {
    id: "test-1",
    name: "Rohan Mehra",
    role: "Founder & CEO",
    company: "BoldFit India",
    avatar: rohanImg,
    text: "CrazyGrowMind Studio changed how we look at social media. Their meme marketing and content strategies are absolutely viral. Our customer acquisition cost dropped by 30% inside 3 months.",
    rating: 5
  },
  {
    id: "test-2",
    name: "Ananya Iyer",
    role: "Chief Marketing Officer",
    company: "Elysian Jewelers",
    avatar: ananyaImg,
    text: "The creative depth this team brings is outstanding. They completely redesigned our visual language and built an online digital flagship that feels incredibly luxurious, driving premium clients to our showrooms.",
    rating: 5
  },
  {
    id: "test-3",
    name: "Karthik Gowda",
    role: "Director of Operations",
    company: "Brew Haven Cafe",
    avatar: karthikImg,
    text: "For retail and store promotions, CrazyGrowMind is the undisputed king. Our opening weekend saw queues down the street. Their local influencer campaigns and geofenced ads work like magic.",
    rating: 5
  }
];

export default TESTIMONIALS_DATA;
