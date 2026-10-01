// Orders Commerce filters by the codes editors list in the Storyblok
// filter_configuration "order" field -- a JSON array such as
// ["FEATURE-METAL", "FEATURE-SHAPE"] (it was a Strapi JSON field). Filters not
// listed keep their API order after the listed ones.
export function reorderFilters(filters = [], order = []) {
  const codes = parseOrder(order);
  if (!codes.length) return filters;

  const filterMap = new Map(
    filters?.map((filter) => [filter.code || filter.featureId, filter]),
  );

  const orderedFilters = [];

  codes.forEach((code) => {
    if (filterMap.has(code)) {
      orderedFilters.push(filterMap.get(code));
      filterMap.delete(code);
    }
  });

  orderedFilters.push(...filterMap.values());

  return orderedFilters;
}

function parseOrder(order) {
  if (Array.isArray(order)) return order;
  if (typeof order !== "string" || !order.trim()) return [];
  try {
    const parsed = JSON.parse(order);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Also accept a plain comma/newline-separated list.
    return order.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }
}
