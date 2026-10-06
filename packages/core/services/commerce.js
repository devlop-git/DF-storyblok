import { headers } from "next/headers";
import { parseSku } from "@df/core/utils/buildSku";
import { categoryName, slugify } from "@df/core/utils/slugify";

// Commerce (Node) APIs. Same calls as the Strapi frontend's services/commerce.js.
const CATEGORY_API =
  process.env.CATEGORY_API_URL || "http://localhost:8010/api/category/v1";
const PLP_API = process.env.PLP_API_URL || "http://localhost:8040/api/plp/v1";
const PDP_API = process.env.PDP_API_URL || "http://localhost:8040/api/pdp/v2";

const SESSION_ID_KEY = "x-session-id";

async function getTransactionId() {
  const headersList = await headers();
  return headersList.get(SESSION_ID_KEY) ?? crypto.randomUUID();
}

// Common fetch wrapper so every Commerce API call carries the same
// x-session-id header the backend uses to track the session (set in proxy.js).
async function commerceFetch(url, options = {}) {
  const transactionId = await getTransactionId();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      [SESSION_ID_KEY]: transactionId,
    },
  });
}

async function fetchCategoryAPI(query) {
  const params = query ? `${query}&batchSize=100` : "batchSize=100";
  const url = `${CATEGORY_API}?${params}`;
  const response = await commerceFetch(url, { cache: "no-store" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Category API error ${response.status}: ${error}`);
  }

  // A response body can only be read once -- read it, then log/return the result.
  const data = await response.json();
  console.log(data);

  return data;
}

// Top-level categories (menu groupings, e.g. "Engagement Rings"). The API
// has no reliable "no parent" filter param, so this fetches everything and
// keeps only entries with no parentCategoryId -- anything WITH one is a
// subcategory and belongs in its parent's dropdown, not the main nav bar.
export async function getCategories(language = "de") {
  const res = await fetchCategoryAPI(`language=${language}`);
  return {
    ...res,
    data: (res.data || []).filter(
      (category) => !category.category_details?.parentCategoryId,
    ),
  };
}

// Leaf subcategories under a parent (the actual PLP-linked entries, e.g.
// "Solitaire" under "Engagement Rings").
export async function getSubCategories(parentCategoryId, language = "de") {
  const filterQuery = JSON.stringify({
    category_details: { isLastLevel: true },
  });
  const search = JSON.stringify({ pathToParent: parentCategoryId });

  const query = `filterQuery=${encodeURIComponent(filterQuery)}&search=${encodeURIComponent(search)}&language=${language}`;
  return fetchCategoryAPI(query);
}

// The PLP route is /{categorySlug}/{subCategorySlug} -- slugs, not the
// categoryId/subCategoryId the Commerce PLP API needs. Walks the same category
// tree the header navigation builds its links from, matching on the same
// slugify(displayName), to recover the real ids.
export async function resolveCategoryIds(categorySlug, subCategorySlug, language = "de") {
  const { data: categories = [] } = await getCategories(language);

  const category = categories.find((c) => slugify(categoryName(c, "")) === categorySlug);
  if (!category) return null;

  const { data: subCategories = [] } = await getSubCategories(category.category_id, language);
  const subCategory = subCategories.find(
    (sc) => slugify(categoryName(sc, "")) === subCategorySlug,
  );
  if (!subCategory) return null;

  return { categoryId: category.category_id, subCategoryId: subCategory.category_id };
}

export async function getPLP(categoryId, subCategoryId, language = "de") {
  const query = `categoryId=${categoryId}&subCategoryId=${subCategoryId}`;
  const response = await commerceFetch(`${PLP_API}/${language}?${query}`, { cache: "no-store" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PLP API error ${response.status}: ${error}`);
  }

  const { data } = await response.json();
  return data?.plp;
}

// Full PDP payload `{ status, data, meta }` for one design configuration.
// Returns null when the design/sku doesn't exist (404) so the page can notFound().
// The options' `isSelected` flags are rewritten to match the SKU in the URL.
export async function getPDP(slug, sku, language = "de") {
  const response = await commerceFetch(
    `${PDP_API}/${language}/design/${slug}/${sku}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PDP API error ${response.status}: ${error}`);
  }

  const payload = await response.json();
  const selections = sku ? parseSku(payload.data.options, sku) : null;
  if (!selections) return payload;

  const options = payload.data.options.map((option) => {
    // Not encoded in the SKU -- keep this option's original defaults.
    if (!(option.name in selections)) return option;

    return {
      ...option,
      values: option.values.map((value) => ({
        ...value,
        isSelected: selections[option.name] === value.valueCode,
      })),
    };
  });

  return { ...payload, data: { ...payload.data, options } };
}

// Categories with their subcategories attached as `children`, for the header menu.
export async function getNavigation(language = "de") {
  const { data: categories = [] } = await getCategories(language);

  return Promise.all(
    categories.map(async (category) => {
      const res = await getSubCategories(category.category_id, language);
      return { ...category, children: res.data || [] };
    }),
  );
}
