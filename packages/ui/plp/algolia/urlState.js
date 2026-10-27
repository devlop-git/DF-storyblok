import { slugify } from "@df/core/utils/slugify";

import { INDEX_NAME } from "./config";

// Readable PLP URLs instead of InstantSearch's default
// ?algolia_feed_poc[refinementList][shapes][0]=Emerald…, e.g.
//   /engagement-rings/solitaire?shape=oval&metal=yellow-gold,rose-gold&price=500-1500&sort=price-asc&page=2
// Facet values are slugs; slug -> real value uses the index's own facet values
// (fetched on the server, see resolveCategory.js), unknown slugs are ignored.

// URL param <-> refinementList attribute, in URL order.
const LIST_PARAMS = [
  ["shape", "shapes"],
  ["stone", "stoneTypes"],
  ["metal", "metalColours"],
  ["karat", "metalKarats"],
  ["gender", "gender"],
];
const RANGE_PARAMS = [
  ["price", "fromPrice"],
  ["carat", "carat"],
];
const SORTS = { "price-asc": `${INDEX_NAME}_price_asc`, "price-desc": `${INDEX_NAME}_price_desc` };
const CATEGORY_ATTRIBUTE = "categories_hierarchical.lvl0";

// Friendlier words for some values (shown the same way in the filter labels).
const VALUE_ALIASES = { gender: { Female: "women", Male: "men" } };

const toSlug = (attribute, value) => VALUE_ALIASES[attribute]?.[value] ?? slugify(value);

// "500:1500" <-> "500-1500", ":1500" <-> "-1500", "500:" <-> "500-"
const rangeToParam = (range) => range.replace(":", "-");
const paramToRange = (param) => {
  const match = /^(\d*\.?\d*)-(\d*\.?\d*)$/.exec(param);
  return match && (match[1] || match[2]) ? `${match[1]}:${match[2]}` : undefined;
};

/** InstantSearch UI state of our index -> flat route ({ q, shape: [slugs], … }). */
export function uiStateToRoute(state = {}, { category } = {}) {
  const route = {};
  if (state.query) route.q = state.query;
  for (const [param, attribute] of LIST_PARAMS) {
    const values = state.refinementList?.[attribute];
    if (values?.length) route[param] = values.map((v) => toSlug(attribute, v));
  }
  // Category tree: on a category page only the sub-category is in the URL.
  const path = state.hierarchicalMenu?.[CATEGORY_ATTRIBUTE];
  if (path?.length) {
    if (!category) route.category = slugify(path[0]);
    if (path[1] && (!category || path[0] === category)) route.style = slugify(path[1]);
  }
  for (const [param, attribute] of RANGE_PARAMS) {
    const range = state.range?.[attribute];
    if (range && range !== ":") route[param] = rangeToParam(range);
  }
  const sort = Object.keys(SORTS).find((key) => SORTS[key] === state.sortBy);
  if (sort) route.sort = sort;
  if (state.page > 1) route.page = state.page;
  return route;
}

/** Flat route -> InstantSearch UI state of our index, resolving slugs to real values. */
export function routeToUiState(route = {}, { facetValues = {}, category } = {}) {
  const fromSlug = (attribute, slug) =>
    (facetValues[attribute] ?? []).find((value) => toSlug(attribute, value) === slug);

  const state = {};
  if (route.q) state.query = route.q;

  for (const [param, attribute] of LIST_PARAMS) {
    const values = (route[param] ?? []).map((slug) => fromSlug(attribute, slug)).filter(Boolean);
    if (values.length) (state.refinementList ??= {})[attribute] = values;
  }

  // facetValues.categories: ["Engagement Ring > Solitaire", …]
  const pairs = (facetValues.categories ?? []).map((lvl1) => lvl1.split(" > "));
  const top = category ?? pairs.find(([lvl0]) => slugify(lvl0) === route.category)?.[0];
  if (top && (route.style || (!category && route.category))) {
    const sub = route.style && pairs.find(([lvl0, lvl1]) => lvl0 === top && slugify(lvl1) === route.style)?.[1];
    state.hierarchicalMenu = { [CATEGORY_ATTRIBUTE]: sub ? [top, sub] : [top] };
  }

  for (const [param, attribute] of RANGE_PARAMS) {
    const range = route[param] && paramToRange(route[param]);
    if (range) (state.range ??= {})[attribute] = range;
  }
  if (SORTS[route.sort]) state.sortBy = SORTS[route.sort];
  if (Number(route.page) > 1) state.page = Number(route.page);
  return state;
}

// Flat route <-> query string. Commas stay readable (metal=yellow-gold,rose-gold).
const PARAM_ORDER = ["q", ...LIST_PARAMS.map(([p]) => p), "category", "style", ...RANGE_PARAMS.map(([p]) => p), "sort", "page"];

function routeToQuery(route) {
  const params = new URLSearchParams();
  for (const key of PARAM_ORDER) {
    const value = route[key];
    if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) continue;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const query = params.toString().replace(/%2C/gi, ",");
  return query ? `?${query}` : "";
}

function queryToRoute(search) {
  const params = new URLSearchParams(search);
  const route = {};
  for (const key of PARAM_ORDER) {
    const value = params.get(key);
    if (!value) continue;
    route[key] = LIST_PARAMS.some(([p]) => p === key) ? value.split(",").filter(Boolean) : value;
  }
  return route;
}

/**
 * `routing` prop for <InstantSearchNext>. Create it once per mount (useMemo):
 * InstantSearchNext builds its router on the first render only.
 */
export function createRouting({ facetValues, category }) {
  return {
    router: {
      cleanUrlOnDispose: false,
      createURL: ({ routeState, location }) => `${location.pathname}${routeToQuery(routeState)}`,
      parseURL: ({ location }) => queryToRoute(location.search),
    },
    stateMapping: {
      stateToRoute: (uiState) => uiStateToRoute(uiState[INDEX_NAME], { category }),
      routeToState: (route) => ({
        [INDEX_NAME]: routeToUiState(route, { facetValues, category }),
      }),
    },
  };
}
