// Algolia PLP configuration (index algolia_feed_poc, see the Algolia POC repo's
// scripts/setup-feed-index.mjs for the index side: settings, rules, synonyms).
// NEXT_PUBLIC_*: the search-only key is safe in the browser; never use the write key here.
import { liteClient as algoliasearch } from "algoliasearch/lite";

export const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

// Virtual replicas of INDEX_NAME.
export const SORT_OPTIONS = [
  { value: INDEX_NAME, label: "Most Recommended" },
  { value: `${INDEX_NAME}_price_asc`, label: "Price: Low to High" },
  { value: `${INDEX_NAME}_price_desc`, label: "Price: High to Low" },
];

export const CATEGORY_ATTRIBUTES = ["categories_hierarchical.lvl0", "categories_hierarchical.lvl1"];

// Design-level facets. Which of these show, and in what order, comes from
// Algolia (dynamic facets: index default + a rule per category context).
export const REFINEMENT_FILTERS = [
  { attribute: "stoneTypes", title: "Stone" },
  { attribute: "shapes", title: "Shape" },
  { attribute: "metalColours", title: "Metal", swatch: true },
  { attribute: "metalKarats", title: "Karat" },
  { attribute: "gender", title: "Gender", labels: { Female: "Women", Male: "Men" } },
];

export const RANGE_FILTERS = [
  { attribute: "fromPrice", title: "Price", prefix: "£", step: 50 },
  { attribute: "carat", title: "Carat", suffix: "ct", step: 0.05 },
];

// Design-level facet -> variant-level attribute: optionalFilters on these make
// each card show the variant that matches the selected filters.
export const VARIANT_ATTRIBUTE = {
  stoneTypes: "stoneType",
  shapes: "shape",
  metalColours: "metalColour",
  metalKarats: "metalKarat",
};

export const ATTRIBUTE_LABELS = {
  "categories_hierarchical.lvl0": "Category",
  "categories_hierarchical.lvl1": "Category",
  ...Object.fromEntries(REFINEMENT_FILTERS.map((f) => [f.attribute, f.title])),
  ...Object.fromEntries(RANGE_FILTERS.map((f) => [f.attribute, f.title])),
};

export const METAL_SWATCHES = {
  Platinum: "#D9D9D6",
  "White Gold": "#E5E4E2",
  "Yellow Gold": "#E6C200",
  "Rose Gold": "#B76E79",
  Silver: "#C0C0C0",
};

// Category values (categories_hierarchical.lvl0) a PLP story can be scoped to.
export const ALGOLIA_CATEGORIES = [
  "Engagement Ring",
  "Diamond Ring",
  "Gemstone",
  "Wedding Ring",
  "Earrings",
  "Pendant",
  "Bracelet",
  "Diamond Jewellery Gifts Sets",
  "Leaf & Clover Collection",
  "Gift Sets",
];

// Rule context that switches on a category's facet order. Must match
// contextFor() in the Algolia POC's scripts/setup-feed-index.mjs.
export const categoryContext = (category) =>
  `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

// Labels for the natural-language rules on the index ("Understood from your search: …").
const RULE_LABELS = {
  "nlp-facet-shapes": "shape",
  "nlp-facet-stoneTypes": "stone",
  "nlp-facet-metalColours": "metal colour",
  "nlp-facet-metalKarats": "karat",
  "nlp-facet-category": "category",
};
export const ruleLabel = (id) =>
  RULE_LABELS[id] ??
  (id.startsWith("nlp-phrase-") ? `"${id.replace("nlp-phrase-", "").replace(/-/g, " ")}"` : null);

// Designs our own PDP (/design/…, Commerce PDP API) can show. Their cards open
// that page; every other card links to the product's live URL from Algolia.
// Comma-separated design codes, e.g. NEXT_PUBLIC_PDP_DESIGNS=CLRN349,CLRN4466
const PDP_DESIGNS = new Set(
  (process.env.NEXT_PUBLIC_PDP_DESIGNS || "CLRN349")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean),
);

// Our PDP URL for a hit, or null. Opens the design's default configuration
// (the PDP fills in the default options for the empty SKU parts).
export function pdpHref(hit) {
  const design = hit.design?.toUpperCase();
  if (!design || !PDP_DESIGNS.has(design)) return null;
  return `/design/${design.toLowerCase()}_01/${design}_MS00MTMFCTST0000SF`;
}

export function formatPrice(amount, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
