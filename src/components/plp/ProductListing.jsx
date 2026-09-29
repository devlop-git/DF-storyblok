"use client";

import { useState } from "react";
import ProductGrid from "./ProductGrid";
import FilterSidebar from "./FilterSidebar";
import { reorderFilters } from "@/utils/reorderFilters";

// Used when the page has no PLP Page story (or its product_listing block has
// empty config fields).
const DEFAULT_TOOLBAR = { showSort: true, showProductCount: true, showFilterButton: true };
const DEFAULT_FILTER = { position: "left", width: 312 };
const DEFAULT_GRID = { desktopColumns: 3, tabColumns: 2, mobileColumns: 2 };

// `data` is the Storyblok product_listing block (layout config);
// `commerce` is the PLP API response (products, filters, sort, pagination).
export default function ProductListing({ data, commerce }) {
  const [selectedSort, setSelectedSort] = useState(commerce?.sort?.selected);

  if (!commerce) {
    // e.g. previewing the PLP Page story at its own URL instead of a category URL.
    return (
      <div className="mx-5 lg:mx-18 border border-dashed border-[#d7b89c] p-10 text-center text-sm text-[#8b6b49]">
        Product listing: products from the Commerce API appear here on category pages
        (e.g. /engagement-rings/solitaire).
      </div>
    );
  }

  const { totalProducts, sort, products, pagination } = commerce;

  const toolbarConfig = data?.toolbarConfig?.[0] ?? DEFAULT_TOOLBAR;
  const filterConfig = data?.filterConfig?.[0] ?? DEFAULT_FILTER;
  const gridConfig = data?.gridConfig?.[0] ?? DEFAULT_GRID;
  const position = filterConfig.position || "left";
  const filters = reorderFilters(commerce.filters, filterConfig.order);

  const sidebar = (
    <FilterSidebar
      // New category page -> fresh filter state (initial selection comes from the API).
      key={commerce.breadcrumb?.at(-1)?.url ?? commerce.category?.id}
      filters={filters}
      selectedSort={selectedSort}
      sortOptions={sort?.options}
      onSortChange={setSelectedSort}
      config={toolbarConfig}
      filterSectionStyleIs={filterConfig}
    />
  );

  return (
    <div className="lg:mx-18 ">
      <div className="flex lg:flex-row flex-col md:gap-8">
        {position === "left" && sidebar}
        <ProductGrid
          products={products}
          filters={filters}
          config={toolbarConfig}
          totalProducts={totalProducts}
          selectedSort={selectedSort}
          sortOptions={sort?.options ?? []}
          pagination={pagination}
          gridColumnsIs={gridConfig}
          onSortChange={setSelectedSort} // sorting/filtering doesn't re-query the API yet (same as Strapi)
        />
        {position === "right" && sidebar}
      </div>
    </div>
  );
}
