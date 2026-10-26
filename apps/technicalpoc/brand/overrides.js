// Technical POC-only Storyblok blocks, merged over the shared registry in
// packages/ui/storyblok/index.js. This space's listing pages get their products
// from Algolia (index algolia_feed_poc): one plp_page story per page, served at
// its slug, scoped by the story's algoliaCategory.
import AlgoliaPlpPage from "@df/ui/storyblok/AlgoliaPlpPage";
import AlgoliaProductListing from "@df/ui/plp/algolia/AlgoliaProductListing";
import { withEditable } from "@df/ui/storyblok/withEditable";

export const brandComponents = {
  plp_page: AlgoliaPlpPage,
  algolia_product_listing: withEditable(AlgoliaProductListing),
};
