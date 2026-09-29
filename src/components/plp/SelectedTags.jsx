"use client";

import { IoClose } from "react-icons/io5";

export default function SelectedTags({
  filters,
  selectedFilters,
  setSelectedFilters,
}) {
  const tags = Object.entries(selectedFilters).flatMap(([featureId, value]) => {
    const filter = filters.find((f) => f.featureId === featureId);

    if (!filter) return [];

    // Range Filter
    if (filter.selectionType === "range") {
      return [
        {
          featureId,
          type: "range",
          displayName: `${value.min}${filter.range.unit || filter.range.currency} - ${value.max}${filter.range.unit || filter.range.currency}`,
        },
      ];
    }

    // Single & Multi
    return value.map((item) => ({
      featureId,
      type: filter.selectionType,
      ...item,
    }));
  });

  if (!tags.length) return null;

  const removeTag = (tag) => {
    setSelectedFilters((prev) => {
      // Remove Range Filter
      if (tag.type === "range") {
        const updated = { ...prev };
        delete updated[tag.featureId];
        return updated;
      }

      // Remove Single / Multi
      return {
        ...prev,
        [tag.featureId]: prev[tag.featureId].filter(
          (item) => item.valueCode !== tag.valueCode,
        ),
      };
    });
  };

  return (
    <div className="flex lg:flex-row flex-col flex-wrap mt-6 lg:mt-0 lg:gap-2 mb-5 gap-y-2 lg:gap-y-0">
      <p className="lg:hidden uppercase text-xs text-[#976649]">filter by:</p>
      {tags.map((tag) => (
        <button
          key={
            tag.type === "range"
              ? tag.featureId
              : `${tag.featureId}-${tag.valueCode}`
          }
          onClick={() => removeTag(tag)}
          className="flex items-center  gap-2  lg:px-3 lg:py-1 text-xs "
        >
          {tag.displayName}
          <IoClose size={16} className="text-[#7b5d3c] hover:cursor-pointer" />
        </button>
      ))}
    </div>
  );
}
