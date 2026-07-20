/**
 * SERVICES DATA REGISTRY INDEX
 * 
 * To ADD a new service:
 * 1. Create a new file under src/data/services/<service-id>.js
 * 2. Import it here: import myNewService from "./my-new-service";
 * 3. Add it to the default array below.
 * 
 * To DELETE an existing service:
 * 1. Remove its import statement below.
 * 2. Remove its variable name from the array export list.
 * 3. (Optional) Delete its individual file.
 */

import digitalMarketing from "./digital-marketing";
import socialMediaMarketing from "./social-media-marketing";
import influencerMarketing from "./influencer-marketing";
import contentCreation from "./content-creation";
import memeMarketing from "./meme-marketing";
import trollMarketing from "./troll-marketing";
import branding from "./branding";
import graphicDesign from "./graphic-design";
import seo from "./seo";
import googleAds from "./google-ads";
import metaAds from "./meta-ads";
import websiteDevelopment from "./website-development";
import photography from "./photography";
import videoEditing from "./video-editing";
import storePromotion from "./store-promotion";
import offlineMarketing from "./offline-marketing";

// Consolidated list of services
const services = [
  digitalMarketing,
  socialMediaMarketing,
  influencerMarketing,
  contentCreation,
  memeMarketing,
  trollMarketing,
  branding,
  graphicDesign,
  seo,
  googleAds,
  metaAds,
  websiteDevelopment,
  photography,
  videoEditing,
  storePromotion,
  offlineMarketing
];

export default services;
