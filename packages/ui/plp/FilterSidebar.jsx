"use client";

import { useEffect, useState } from "react";
import Button from "../common/Button";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import BottomSheet from "./BottomSheet";
import FilterContent from "./FilterContent";

// Pre-selected values from the Commerce API ({ [featureId]: [value, …] }).
function initialSelection(filters) {
  const initial = {};
  filters?.forEach((filter) => {
    const selected = filter.values?.filter((item) => item.isSelected);
    if (selected?.length) initial[filter.featureId] = selected;
  });
  return initial;
}

export default function FilterSidebar({
  filters,
  selectedSort,
  sortOptions,
  onSortChange,
  config,
  filterSectionStyleIs,
}) {
  const [selectedFilters, setSelectedFilters] = useState(() => initialSelection(filters));
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const trigger = 250; // adjust this value

      setIsSticky(window.scrollY >= trigger);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hooks above run unconditionally; the Strapi version returned before them.
  if (!filters) return null;

  const clearAll = () => {
    setSelectedFilters({});
  };

  return (
    <div className="">
      <div
        className={`left-0 right-0 z-50 bg-white py-3 transition-all duration-300 lg:hidden ${
          isSticky ? "fixed top-0 shadow-sm " : "relative"
        }`}
      >
        <div className="mx-4">
          <Button
            text="Filter & sort"
            count={1}
            onClick={() => setIsOpen(true)}
            icon={HiOutlineAdjustmentsHorizontal}
            className="h-12 w-full bg-brand-accent text-white hover:bg-brand-accent-hover"
            iconClassName="h-7 w-7"
            textClassName="text-base font-medium"
            badgeClassName="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[12px] font-semibold text-brand-accent"
          />
        </div>

        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={
            <div className="flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 border border-brand-filter-strong py-3 text-lg font-medium "
              >
                Clear
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 bg-brand-primary  text-base font-medium text-white"
              >
                Apply Filters
                <span className="flex h-4 w-4 items-center justify-center rounded-md bg-white text-xs font-semibold text-brand-primary">
                  1
                </span>
              </button>
            </div>
          }
        >
          <FilterContent
            filters={filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            clearAll={clearAll}
            className="pb-4"
            setIsOpen={setIsOpen}
            selectedSort={selectedSort}
            sortOptions={sortOptions}
            onSortChange={onSortChange}
            config={config}
          />
        </BottomSheet>
      </div>
      <div
        className={`hidden lg:block `}
        style={{
          width: `${filterSectionStyleIs?.width || 312}px`,
        }}
      >
        <FilterContent
          filters={filters}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          clearAll={clearAll}
        />
      </div>
    </div>
  );
}
