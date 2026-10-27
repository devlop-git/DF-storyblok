import { cache } from "react";
import { StoryblokStory } from "@df/ui/storyblok";
import { notFound } from "next/navigation";

import { brand } from "@brand/config";

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

// One Algolia lookup per request, shared by generateMetadata and the page.
const resolveCategory = cache(resolveAlgoliaCategory);

// URL params that make a filtered / sorted / paged / searched variant (urlState.js).
const VARIANT_PARAMS = ["q", "shape", "stone", "metal", "karat", "gender", "category", "style", "price", "carat", "sort", "page"];

// SEO: one indexable page per category. Filtered variants point to it
// (canonical) and aren't indexed themselves, so Google doesn't crawl every
// filter combination.
export async function generateMetadata({ params, searchParams }) {
  const { category: categorySlug, subCategory: subCategorySlug } = await params;
  const query = await searchParams;
  const match = await resolveCategory(categorySlug, subCategorySlug);
  if (!match) return {};

  const isVariant = VARIANT_PARAMS.some((key) => query?.[key]);
  const plural = match.category.endsWith("s") ? match.category : `${match.category}s`;
  const name = match.subCategory ? `${match.subCategory} ${plural}` : plural;
  return {
    title: `${name} | ${brand.name}`,
    alternates: { canonical: `/${categorySlug}/${subCategorySlug}` },
    ...(isVariant && { robots: { index: false, follow: true } }),
  };
}

export default async function AlgoliaCategoryPage({ params }) {
  const { category: categorySlug, subCategory: subCategorySlug } = await params;

  const match = await resolveCategory(categorySlug, subCategorySlug);
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
    // Facet values, to read the readable filter URLs (?metal=yellow-gold) back.
    facetValues: match.facetValues,
  };

  if (layout) return <StoryblokStory story={layout} {...scope} />;
  return <AlgoliaPlpPage blok={{ plp_section: [] }} {...scope} />;
}
