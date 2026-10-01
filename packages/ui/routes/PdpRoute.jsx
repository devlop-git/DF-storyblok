import { StoryblokStory } from "@df/ui/storyblok";
import { notFound } from "next/navigation";

import PdpProduct from "@df/ui/pdp/PdpProduct";
import { getCurrentLocale } from "@df/core/lib/locale";
import { fetchStoryForMarket } from "@df/core/lib/market";
import { getPDP } from "@df/core/services/commerce";

// Route shape: /design/{slug}/{designRef}_{sku}
//   e.g. /design/clrn4466_01/CLRN4466_MS00MTMFCTST0000SF
// `slug` identifies the design, `sku` the exact selected configuration.
// Option clicks in <PdpDetails /> fetch new configurations client-side via
// /api/pdp and update the URL in place.
//
// Product data comes from the Commerce PDP API; the sections below the
// product come from the first Storyblok "pdp_page" story.
export default async function PDPPage({ params }) {
  const { slug, sku } = await params;
  const locale = await getCurrentLocale();

  const [result, layout] = await Promise.all([
    getPDP(slug, sku, locale),
    fetchStoryForMarket("pdp_page", "markets"),
  ]);
  if (!result?.data) notFound();

  const pdp = { data: result.data, meta: result.meta, slug, sku, locale };

  if (layout) {
    // Extra props on StoryblokStory reach the root component (PdpPage), and
    // live editing in the Visual Editor keeps working.
    return <StoryblokStory story={layout} pdp={pdp} />;
  }

  // No PDP Page story in Storyblok yet: just the product.
  return <PdpProduct pdp={pdp} />;
}
