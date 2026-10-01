import { setComponents, StoryblokStory } from "@storyblok/react/rsc";

import ProductListing from "@df/ui/plp/ProductListing";
import BannerInfo from "@df/ui/SharedComponents/Banners/BannerInfo";
import ImageBanner from "@df/ui/SharedComponents/Banners/ImageBanner";
import PromotionBanner from "@df/ui/SharedComponents/Banners/PromotionBanner";
import ImageCardCarousel from "@df/ui/SharedComponents/Carousels/ImageCardCarousel";
import InstagramFeed from "@df/ui/SharedComponents/Carousels/InstagramFeed";
import FAQSection from "@df/ui/SharedComponents/ContentBlocks/FAQSection";
import ReadMoreContent from "@df/ui/SharedComponents/ContentBlocks/ReadMoreContent";
import RichTextSection from "@df/ui/SharedComponents/ContentBlocks/RichTextSection";
import ContactUsForm from "@df/ui/SharedComponents/Forms/ContactUsForm";
import NewsletterSignup from "@df/ui/SharedComponents/Forms/NewsletterSignup";
import FeatureHighlights from "@df/ui/SharedComponents/Grids/FeatureHighlights";
import ImageGrid from "@df/ui/SharedComponents/Grids/ImageGrid";
import PromotionBannerGrid from "@df/ui/SharedComponents/Grids/PromotionBannerGrid";
import HeroCarousel from "@df/ui/SharedComponents/Sections/HeroCarousel";
import ImageTextSection from "@df/ui/SharedComponents/Sections/ImageTextSection";
import ReviewsSection from "@df/ui/SharedComponents/SocialProof/ReviewsSection";

import { brandComponents } from "@brand/overrides";

import HomePage from "./HomePage";
import NodeApiList from "./NodeApiList";
import PdpPage from "./PdpPage";
import PlpPage from "./PlpPage";
import StaticPage from "./StaticPage";
import { withEditable } from "./withEditable";

// Keys must match the "technical name" of each block in Storyblok
// (Block Library in the CMS UI). Add a line here for every new block you create.
export const components = {
  // Content types
  home_page: HomePage,
  plp_page: PlpPage,
  pdp_page: PdpPage,
  static_page: StaticPage,

  // Home page sections, ported from the Strapi frontend (same map as its SectionRenderer)
  new_home_page: withEditable(HeroCarousel),
  slides: withEditable(HeroCarousel),
  image_text_section: withEditable(ImageTextSection),
  feature_highlights: withEditable(FeatureHighlights),
  image_grid: withEditable(ImageGrid),
  promotion_banner_grid: withEditable(PromotionBannerGrid),
  promotion_banner: withEditable(PromotionBanner),
  reviews: withEditable(ReviewsSection),
  instagram_feed: withEditable(InstagramFeed),
  newsletter: withEditable(NewsletterSignup),
  image_card_carousel: withEditable(ImageCardCarousel),
  image_banner: withEditable(ImageBanner),
  contact_us_form: withEditable(ContactUsForm),
  faq: withEditable(FAQSection),

  // PLP sections (same map as the Strapi PlpSectionRenderer). product_listing
  // gets the Commerce API data via the `commerce` prop from PlpPage.
  product_listing: withEditable(ProductListing),
  read_more_content: withEditable(ReadMoreContent),
  banner_info: withEditable(BannerInfo),
  rich_text: withEditable(RichTextSection),

  // Node API example (not created in Storyblok yet)
  node_api_list: NodeApiList,

  // Brand-specific versions of any block above (apps/<brand>/brand/overrides.js).
  ...brandComponents,
};

// Register the blocks on every import -- also after a hot reload in `next dev`
// (storyblokInit skips its `components` option once a client exists).
setComponents(components);

// Routes render stories through this re-export, so importing it guarantees
// the blocks above are registered first.
export { StoryblokStory };
