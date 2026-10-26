import { slugify } from "@df/core/utils/slugify";

import { INDEX_NAME, searchClient } from "./config";

// Menu links are /{category}/{subCategory} built from the Commerce category
// names ("Engagement Rings" / "Full Eternity Rings"), while the Algolia index
// has "Engagement Ring" / "Full Eternity". Compare slugs without a trailing
// "-ring(s)" or plural "s".
const normalize = (value) =>
  slugify(value)
    .replace(/-rings?$/, "")
    .replace(/s$/, "");

/**
 * The Algolia category (categories_hierarchical.lvl0) and sub-category
 * (lvl1 "Category > Sub") for a menu URL, e.g.
 *   ("engagement-rings", "solitaire") -> { category: "Engagement Ring", subCategory: "Solitaire", lvl1: "Engagement Ring > Solitaire" }
 * subCategory is null when only the category matches (that menu entry has no
 * products of its own in Algolia); null when the category doesn't match either.
 */
export async function resolveAlgoliaCategory(categorySlug, subCategorySlug) {
  const { results } = await searchClient.search({
    requests: [
      {
        indexName: INDEX_NAME,
        hitsPerPage: 0,
        facets: ["categories_hierarchical.lvl1"],
        maxValuesPerFacet: 1000,
        analytics: false,
      },
    ],
  });

  const values = Object.keys(results[0].facets?.["categories_hierarchical.lvl1"] ?? {});
  const pairs = values.map((lvl1) => {
    const [category, subCategory] = lvl1.split(" > ");
    return { category, subCategory, lvl1 };
  });

  const inCategory = pairs.filter((p) => normalize(p.category) === normalize(categorySlug));
  if (!inCategory.length) return null;

  const match = inCategory.find((p) => normalize(p.subCategory) === normalize(subCategorySlug));
  return match ?? { category: inCategory[0].category, subCategory: null, lvl1: null };
}
