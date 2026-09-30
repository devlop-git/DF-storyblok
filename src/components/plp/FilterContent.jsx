"use client";

import { FiSliders } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import FilterGroup from "./FilterGroup";
import SelectedTags from "./SelectedTags";
import Toolbar from "./Toolbar";

export default function FilterContent({
  filters,
  selectedFilters,
  setSelectedFilters,
  clearAll,
  className = "",
  setIsOpen,
  selectedSort,
  sortOptions,
  onSortChange,
  config,
}) {
  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-brand-filter">
          <FiSliders />
          <span className="hidden lg:block">Filters</span>
          <span className=" lg:hidden">Filters & sort</span>
        </div>

        <button
          onClick={clearAll}
          className="text-xs hover:cursor-pointer hidden lg:block uppercase underline text-brand-filter"
        >
          Clear All
        </button>
        <button
          onClick={() => {
            setIsOpen?.(false);
          }}
          className="lg:hidden"
        >
          <IoClose size={24} />
        </button>
      </div>
      <div>
        <Toolbar
          selectedSort={selectedSort}
          sortOptions={sortOptions}
          onSortChange={onSortChange}
          config={config}
        />
      </div>

      <SelectedTags
        filters={filters}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />

      {filters.map((filter) => (
        <FilterGroup
          key={filter.featureId}
          filter={filter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      ))}
    </div>
  );
}
