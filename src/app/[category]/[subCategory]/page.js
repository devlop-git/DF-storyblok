import { StoryblokStory } from "@storyblok/react/rsc";
import { notFound } from "next/navigation";

import Breadcrumb from "@/components/common/Breadcrumb";
import ProductListing from "@/components/plp/ProductListing";
import { getCurrentLocale } from "@/lib/locale";
import { fetchStoryForMarket } from "@/lib/market";
import { fetchStory, STORY_RELATIONS } from "@/lib/storyblok";
import { getPLP, resolveCategoryIds } from "@/services/commerce";

// Route shape: /{category}/{subCategory}, e.g. /engagement-rings/solitaire.
// Only subcategories are real listing pages (categories are menu groupings),
// so the PLP route is always two segments.
//
// Products, filters, sort and breadcrumb come from the Commerce PLP API; the
// page layout (sections around the products) comes from the Storyblok
// "plp_page" story -- the same split as the Strapi frontend.
//
// This fixed 2-segment route wins over the [...slug] catch-all for ANY
// 2-segment URL, so when it isn't a real category, fall back to a Storyblok
// story at that path (e.g. /customer-care/valuations) before a 404.
export default async function PLPPage({ params }) {
  const { category, subCategory } = await params;
  const locale = await getCurrentLocale();

  const ids = await resolveCategoryIds(category, subCategory, locale);
  if (!ids) {
    const story = await fetchStory(`${category}/${subCategory}`, {
      resolve_relations: STORY_RELATIONS,
    });
    if (!story) notFound();
    return <StoryblokStory story={story} bridgeOptions={{ resolveRelations: STORY_RELATIONS }} />;
  }

  const [commerce, layout] = await Promise.all([
    getPLP(ids.categoryId, ids.subCategoryId, locale),
    fetchStoryForMarket("plp_page", "markets"),
  ]);

  if (layout) {
    // Extra props on StoryblokStory are passed to the root component (PlpPage),
    // and live editing in the Visual Editor keeps working.
    return <StoryblokStory story={layout} commerce={commerce} />;
  }

  // No PLP Page story in Storyblok yet: show the products with default layout.
  return (
    <main className="max-w-10xl mx-auto flex flex-col gap-y-6 text-black">
      <Breadcrumb items={commerce?.breadcrumb} />
      <ProductListing commerce={commerce} />
    </main>
  );
}
