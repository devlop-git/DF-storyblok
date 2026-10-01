import ProductCard from "./ProductCard";
import Toolbar from "./Toolbar";
import Pagination from "./Pagination";

// Storyblok number fields arrive as strings ("3"), which still match these keys.
const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const mdGridCols = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const lgGridCols = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export default function ProductGrid({
  products,
  filters,
  config,
  totalProducts,
  selectedSort,
  sortOptions,
  onSortChange,
  pagination,
  gridColumnsIs,
}) {
  return (
    <div className="mx-5 lg:mx-0 flex-1">
      <div className="flex justify-between">
        <h1 className="text-sm my-2 lg:my-0">
          {config?.showProductCount && <span>{totalProducts} Products</span>}
        </h1>

        <div className="hidden lg:block">
          <Toolbar
            selectedSort={selectedSort}
            sortOptions={sortOptions}
            onSortChange={onSortChange}
            config={config}
          />
        </div>
      </div>

      <div
        className={` grid
    ${gridCols[gridColumnsIs?.mobileColumns] ?? "grid-cols-2"}
    ${mdGridCols[gridColumnsIs?.tabColumns] ?? ""}
    ${lgGridCols[gridColumnsIs?.desktopColumns] ?? "lg:grid-cols-3"} gap-2 md:gap-2 lg:gap-6`}
      >
        {products?.map((product) => (
          <ProductCard
            key={product.sku || product.designRef}
            product={product}
            filters={filters}
          />
        ))}
      </div>
      <Pagination pagination={pagination} />
    </div>
  );
}
