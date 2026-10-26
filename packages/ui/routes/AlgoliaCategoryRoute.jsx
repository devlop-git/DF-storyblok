import { StoryblokStory } from "@df/ui/storyblok";
import { notFound } from "next/navigation";

import { fetchFirstStory, fetchStory, STORY_RELATIONS } from "@df/core/lib/storyblok";
import AlgoliaPlpPage from "@df/ui/storyblok/AlgoliaPlpPage";
import { resolveAlgoliaCategory } from "@df/ui/plp/algolia/resolveCategory";

// Slug of the plp_page story whose layout every category URL uses.
const LAYOUT_SLUG = "plp-layout";

// Algolia PLP for the menu's /{category}/{subCategory} links, e.g.
// /engagement-rings/solitaire. The category comes from the URL (matched to
// the Algolia category tree), the page layout from the Storyblok "plp-layout"
// story (any plp_page story if that one doesn't exist).
//
// This fixed 2-segment route wins over the [...slug] catch-all for ANY
// 2-segment URL, so when it isn't a product category, fall back to a
// Storyblok story at that path before a 404.
export default async function AlgoliaCategoryPage({ params }) {
  const { category: categorySlug, subCategory: subCategorySlug } = await params;

  const match = await resolveAlgoliaCategory(categorySlug, subCategorySlug);
  if (!match) {
    const story = await fetchStory(`${categorySlug}/${subCategorySlug}`, {
      resolve_relations: STORY_RELATIONS,
    }).catch(() => null);
    if (!story) notFound();
    return <StoryblokStory story={story} bridgeOptions={{ resolveRelations: STORY_RELATIONS }} />;
  }

  // Keep the page working (no Storyblok sections) if Storyblok can't be reached.
  const layout =
    (await fetchStory(LAYOUT_SLUG).catch(() => null)) ??
    (await fetchFirstStory("plp_page").catch(() => null));

  // Extra props on StoryblokStory reach the root component (AlgoliaPlpPage)
  // and override the story's own algoliaCategory.
  const scope = {
    algoliaCategory: match.category,
    algoliaSubCategory: match.subCategory,
  };

  if (layout) return <StoryblokStory story={layout} {...scope} />;
  return <AlgoliaPlpPage blok={{ plp_section: [] }} {...scope} />;
}
