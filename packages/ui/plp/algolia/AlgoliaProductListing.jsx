"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {
  Configure,
  useHits,
  useInstantSearch,
  usePagination,
  useSearchBox,
  useSortBy,
  useStats,
} from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { storyblokEditable } from "@storyblok/react/rsc";

import AlgoliaFilters from "./AlgoliaFilters";
import AlgoliaProductCard from "./AlgoliaProductCard";
import {
  INDEX_NAME,
  SORT_OPTIONS,
  VARIANT_ATTRIBUTE,
  categoryContext,
  ruleLabel,
  searchClient,
} from "./config";
import { parseQuery } from "./queryParser";
import { createRouting } from "./urlState";

const FUTURE = { preserveSharedStateOnUnmount: true };

// Storyblok number fields arrive as strings ("3"), which still match these keys.
const gridCols = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
const mdGridCols = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };
const lgGridCols = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

// Per-search params that depend on the page's category and what the shopper selected.
function SearchConfig({ category, subCategory, hitsPerPage }) {
  const { indexUiState } = useInstantSearch();
  // A typed search covers all jewellery: the index's language rules turn words
  // like "diamond ring" into a category filter, which would clash with the
  // page's own category (e.g. Solitaire) and give 0 results.
  const scoped = Boolean(category) && !indexUiState.query?.trim();
  // Page category (from the URL / Storyblok), or the one picked in the category tree
  const activeCategory =
    (scoped && category) || indexUiState.hierarchicalMenu?.["categories_hierarchical.lvl0"]?.[0];

  // Show the variant matching the selected filters on each design card
  const optionalFilters = Object.entries(indexUiState.refinementList ?? {}).flatMap(
    ([attribute, values]) =>
      VARIANT_ATTRIBUTE[attribute] ? values.map((v) => `${VARIANT_ATTRIBUTE[attribute]}:${v}`) : [],
  );

  // On the virtual price replicas, facetingAfterDistinct + facets makes Algolia
  // return an approximate subset (~320 of 1,664 designs, wrong order), so it's
  // only sent on the primary index; sorted views count facets per variant.
  const sortedByReplica = Boolean(indexUiState.sortBy) && indexUiState.sortBy !== INDEX_NAME;

  return (
    <Configure
      hitsPerPage={hitsPerPage}
      facetingAfterDistinct={!sortedByReplica}
      getRankingInfo
      optionalFilters={optionalFilters}
      // Dynamic facets per category (rules on the index)
      ruleContexts={activeCategory ? [categoryContext(activeCategory)] : []}
      filters={
        !scoped
          ? ""
          : subCategory
            ? `categories_hierarchical.lvl1:"${category} > ${subCategory}"`
            : `category:"${category}"`
      }
    />
  );
}

// Plain typing searches as you type; on Enter, price/carat phrases become filters.
function SmartSearchBox({ placeholder }) {
  const { query, refine } = useSearchBox();
  const { setIndexUiState } = useInstantSearch();
  const [value, setValue] = useState(query);
  const [understood, setUnderstood] = useState([]);

  const onSubmit = (event) => {
    event.preventDefault();
    const parsed = parseQuery(value);
    setUnderstood(parsed.understood);
    if (!parsed.understood.length) return refine(value);
    setValue(parsed.query);
    setIndexUiState((state) => ({
      ...state,
      query: parsed.query,
      page: 1,
      range: { ...state.range, ...parsed.range },
    }));
  };

  return (
    <form onSubmit={onSubmit} role="search" className="mb-4">
      <input
        type="search"
        value={value}
        placeholder={placeholder || 'Try "oval lab grown ring in rose gold under £1500"'}
        onChange={(event) => {
          setValue(event.target.value);
          setUnderstood([]);
          refine(event.target.value);
        }}
        aria-label="Search jewellery"
        className="w-full border border-[#d7b89c] bg-white px-4 py-3 text-sm outline-none focus:border-brand-filter"
      />
      {understood.length > 0 && (
        <p className="mt-1 text-xs text-brand-filter">Applied as filters: {understood.join(", ")}</p>
      )}
    </form>
  );
}

function ResultSummary({ category }) {
  const { nbHits } = useStats();
  const { results, indexUiState } = useInstantSearch();
  const detected = [
    ...new Set((results?.appliedRules ?? []).map((rule) => ruleLabel(rule.objectID)).filter(Boolean)),
  ];
  // See SearchConfig: a typed search on a category page searches all jewellery.
  const searchingAll = Boolean(category) && Boolean(indexUiState.query?.trim());

  return (
    <div>
      <p className="text-sm text-brand-filter">
        {nbHits.toLocaleString("en-GB")} {nbHits === 1 ? "design" : "designs"} found
        {searchingAll && " in all jewellery"}
      </p>
      {detected.length > 0 && (
        <p className="text-xs text-gray-500">Understood from your search: {detected.join(", ")}</p>
      )}
    </div>
  );
}

function SortSelect() {
  const { currentRefinement, options, refine } = useSortBy({ items: SORT_OPTIONS });
  return (
    <select
      value={currentRefinement}
      onChange={(event) => refine(event.target.value)}
      aria-label="Sort by"
      className="h-10 border border-[#d7b89c] bg-white px-3 text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Storyblok "plp_promo_tile": an editorial tile placed in the product grid at
// `position` (1 = first cell), e.g. "Book an appointment".
function PromoTile({ blok }) {
  const href = blok.link?.cached_url || blok.link?.url;
  const tile = (
    <div
      {...storyblokEditable(blok)}
      className="relative flex h-full min-h-[300px] flex-col items-center justify-center overflow-hidden bg-[#3b2a20] bg-cover bg-center p-6 text-center text-white"
      style={blok.image?.filename ? { backgroundImage: `url(${blok.image.filename})` } : undefined}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative space-y-3">
        {blok.title && <h3 className="text-3xl font-['Lucida_Bright',serif]">{blok.title}</h3>}
        {blok.text && <p className="text-sm">{blok.text}</p>}
        {blok.button_label && (
          <span className="inline-block bg-white px-6 py-2 text-xs font-semibold uppercase text-black">
            {blok.button_label}
          </span>
        )}
      </div>
    </div>
  );
  if (!href) return tile;
  return <Link href={href.startsWith("http") ? href : `/${href.replace(/^\//, "")}`}>{tile}</Link>;
}

function ResultsGrid({ promoTiles = [], gridConfig }) {
  const { items } = useHits();
  const { status, results } = useInstantSearch();

  if (!items.length) {
    return status === "idle" ? (
      <p className="py-16 text-center text-sm">No designs match this search and these filters.</p>
    ) : null;
  }

  // Products with the promo tiles slotted in at their positions (first results page only).
  const cells = items.map((hit) => ({ hit }));
  const tiles = (results?.page ?? 0) === 0 ? promoTiles : [];
  [...tiles]
    .sort((a, b) => Number(a.position) - Number(b.position))
    .forEach((tile) => {
      const at = Math.min(Math.max(Number(tile.position) || 1, 1) - 1, cells.length);
      cells.splice(at, 0, { tile });
    });

  return (
    <div
      className={`grid gap-2 md:gap-2 lg:gap-6 ${gridCols[gridConfig?.mobileColumns] ?? "grid-cols-2"} ${
        mdGridCols[gridConfig?.tabColumns] ?? ""
      } ${lgGridCols[gridConfig?.desktopColumns] ?? "lg:grid-cols-3"}`}
    >
      {cells.map((cell) =>
        cell.tile ? (
          <PromoTile key={cell.tile._uid} blok={cell.tile} />
        ) : (
          <AlgoliaProductCard key={cell.hit.objectID} hit={cell.hit} />
        ),
      )}
    </div>
  );
}

function PaginationNav() {
  const { pages, currentRefinement, isFirstPage, isLastPage, nbPages, refine, createURL } =
    usePagination({ padding: 2 });
  if (nbPages <= 1) return null;

  const go = (page) => (event) => {
    event.preventDefault();
    refine(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const item = (page, label, disabled, current) => (
    <a
      key={label}
      href={disabled ? undefined : createURL(page)}
      onClick={disabled ? undefined : go(page)}
      aria-current={current ? "page" : undefined}
      aria-disabled={disabled || undefined}
      className={`flex h-9 min-w-9 items-center justify-center border px-2 text-sm ${
        current
          ? "border-brand-filter bg-brand-filter text-white"
          : disabled
            ? "border-[#eee] text-gray-300"
            : "border-[#d7b89c] text-brand-filter hover:bg-[#f1e3d2]"
      }`}
    >
      {label}
    </a>
  );

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {item(currentRefinement - 1, "‹", isFirstPage)}
      {pages.map((page) => item(page, String(page + 1), false, page === currentRefinement))}
      {item(currentRefinement + 1, "›", isLastPage)}
    </nav>
  );
}

// Storyblok "algolia_product_listing" block: smart search, dynamic facets,
// sort, products and pagination from Algolia. `data` is the block (page size,
// filter/grid config, promo tiles). `algoliaCategory` / `algoliaSubCategory`
// come from the URL (/engagement-rings/solitaire) or the plp_page story: exact
// categories_hierarchical values; no category = all products.
export default function AlgoliaProductListing({
  data,
  algoliaCategory,
  algoliaSubCategory,
  facetValues,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const category = algoliaCategory || undefined;
  const subCategory = (category && algoliaSubCategory) || undefined;
  // Readable URLs (?shape=oval&metal=yellow-gold&sort=price-asc), see urlState.js.
  // Built once: InstantSearchNext creates its router on the first render only
  // (the component is re-keyed when the category changes).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const routing = useMemo(() => createRouting({ facetValues, category }), []);
  const toolbarConfig = data?.toolbarConfig?.[0] ?? { showSort: true, showProductCount: true };
  const filterConfig = data?.filterConfig?.[0] ?? {};
  const gridConfig = data?.gridConfig?.[0];
  console.log('config--', filterConfig);
  const position = filterConfig.position === "right" ? "right" : "left";

  const filters = (
    <AlgoliaFilters
      category={category}
      subCategory={subCategory}
      open={filtersOpen}
      onClose={() => setFiltersOpen(false)}
      width={Number(filterConfig.width) || 280}
    />
  );

  return (
    // Keyed by scope: moving between category URLs remounts the search with fresh state.
    <InstantSearchNext
      key={`${category ?? ""}|${subCategory ?? ""}`}
      searchClient={searchClient}
      indexName={INDEX_NAME}
      routing={routing}
      future={FUTURE}
    >
      <SearchConfig
        category={category}
        subCategory={subCategory}
        hitsPerPage={Number(data?.hits_per_page) || 24}
      />

      <div className="mx-5 flex flex-col gap-8 lg:mx-18 lg:flex-row">
        {position === "left" && filters}

        <section className="min-w-0 flex-1">
          {data?.show_search !== false && <SmartSearchBox placeholder={data?.search_placeholder} />}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {toolbarConfig.showProductCount !== false && <ResultSummary category={category} />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-10 items-center gap-2 bg-brand-accent px-4 text-sm font-medium text-white lg:hidden"
              >
                <HiOutlineAdjustmentsHorizontal size={20} />
                Filter
              </button>
              {toolbarConfig.showSort !== false && <SortSelect />}
            </div>
          </div>

          <ResultsGrid promoTiles={data?.promo_tiles} gridConfig={gridConfig} />
          <PaginationNav />
        </section>

        {position === "right" && filters}
      </div>
    </InstantSearchNext>
  );
}
