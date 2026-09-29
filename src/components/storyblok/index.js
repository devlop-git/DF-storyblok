import ProductListing from "@/components/plp/ProductListing";
import BannerInfo from "@/components/SharedComponents/Banners/BannerInfo";
import ImageBanner from "@/components/SharedComponents/Banners/ImageBanner";
import PromotionBanner from "@/components/SharedComponents/Banners/PromotionBanner";
import ImageCardCarousel from "@/components/SharedComponents/Carousels/ImageCardCarousel";
import InstagramFeed from "@/components/SharedComponents/Carousels/InstagramFeed";
import FAQSection from "@/components/SharedComponents/ContentBlocks/FAQSection";
import ReadMoreContent from "@/components/SharedComponents/ContentBlocks/ReadMoreContent";
import RichTextSection from "@/components/SharedComponents/ContentBlocks/RichTextSection";
import ContactUsForm from "@/components/SharedComponents/Forms/ContactUsForm";
import NewsletterSignup from "@/components/SharedComponents/Forms/NewsletterSignup";
import FeatureHighlights from "@/components/SharedComponents/Grids/FeatureHighlights";
import ImageGrid from "@/components/SharedComponents/Grids/ImageGrid";
import PromotionBannerGrid from "@/components/SharedComponents/Grids/PromotionBannerGrid";
import HeroCarousel from "@/components/SharedComponents/Sections/HeroCarousel";
import ImageTextSection from "@/components/SharedComponents/Sections/ImageTextSection";
import ReviewsSection from "@/components/SharedComponents/SocialProof/ReviewsSection";

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
};
