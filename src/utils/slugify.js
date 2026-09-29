// Turns a display name into a URL-safe slug, e.g. "Engagement Rings" -> "engagement-rings".
// Used to build PLP/PDP breadcrumb & nav URLs until Commerce provides real slugs per category.
export function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Category names from the Commerce API, with the same fallbacks the Strapi frontend used.
export function categoryName(category, fallback = "Category") {
  return (
    category?.category_details?.displayCategoryName?.en ??
    category?.category_details?.categoryName ??
    fallback
  );
}
