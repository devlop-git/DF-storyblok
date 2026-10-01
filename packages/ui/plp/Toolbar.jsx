"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function Toolbar({
  selectedSort,
  sortOptions = [],
  onSortChange,
  config,
}) {
  const [open, setOpen] = useState(false);

  if (!config?.showSort || !sortOptions.length) return null;

  const selectedOption =
    sortOptions.find((option) => option.id === selectedSort) || sortOptions[0];

  return (
    <div className="relative w-full">
      {/* Selected Option */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex lg:gap-x-4 lg:hover:cursor-pointer h-12 lg:h-auto w-full items-center justify-between rounded-md border lg:border-0 border-[#B8B8B8] bg-white px-6 text-left"
      >
        <span className="text-sm font-medium text-[#1D1D1D]">
          {selectedOption?.label}
        </span>

        <FiChevronDown
          className={`h-7 lg:h-5 w-7 lg:w-5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-lg">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onSortChange(option.id);
                setOpen(false);
              }}
              className={`w-full px-6 py-4 text-left text-sm transition hover:bg-[#F8F8F8] ${
                option.id === selectedSort
                  ? "bg-[#F8F8F8] font-medium text-brand-primary"
                  : "text-[#1D1D1D]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
