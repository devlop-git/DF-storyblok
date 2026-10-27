import { slugify } from "@df/core/utils/slugify";

import { INDEX_NAME, REFINEMENT_FILTERS, searchClient } from "./config";

// Menu links are /{category}/{subCategory} built from the Commerce category
// names ("Engagement Rings" / "Full Eternity Rings"), while the Algolia index
// has "Engagement Ring" / "Full Eternity". Compare slugs without a trailing
// "-ring(s)" or plural "s".
const normalize = (value) =>
  slugify(value)
    .replace(/-rings?$/, "")
    .replace(/s$/, "");

const CATEGORY_LVL1 = "categories_hierarchical.lvl1";

/**
 * The Algolia category (categories_hierarchical.lvl0) and sub-category
 * (lvl1 "Category > Sub") for a menu URL, e.g.
 *   ("engagement-rings", "solitaire") -> { category: "Engagement Ring", subCategory: "Solitaire", … }
 * subCategory is null when only the category matches (that menu entry has no
 * products of its own in Algolia); null when the category doesn't match either.
 *
 * Also returns `facetValues` ({ shapes: [...], …, categories: ["Engagement Ring > Solitaire", …] }):
 * every value of the filter facets, so the readable URL slugs
 * (?metal=yellow-gold) can be turned back into real values (urlState.js).
 */
export async function resolveAlgoliaCategory(categorySlug, subCategorySlug) {
  const { results } = await searchClient.search({
    requests: [
      {
        indexName: INDEX_NAME,
        hitsPerPage: 0,
        facets: [CATEGORY_LVL1, ...REFINEMENT_FILTERS.map((f) => f.attribute)],
        maxValuesPerFacet: 1000,
        analytics: false,
      },
    ],
  });

  const facets = results[0].facets ?? {};
  const facetValues = {
    ...Object.fromEntries(
      REFINEMENT_FILTERS.map((f) => [f.attribute, Object.keys(facets[f.attribute] ?? {})]),
    ),
    categories: Object.keys(facets[CATEGORY_LVL1] ?? {}),
  };

  const pairs = facetValues.categories.map((lvl1) => {
    const [category, subCategory] = lvl1.split(" > ");
    return { category, subCategory };
  });

  const inCategory = pairs.filter((p) => normalize(p.category) === normalize(categorySlug));
  if (!inCategory.length) return null;

  const match = inCategory.find((p) => normalize(p.subCategory) === normalize(subCategorySlug));
  return {
    category: inCategory[0].category,
    subCategory: match?.subCategory ?? null,
    facetValues,
  };
}
