"use client";

import { useState } from "react";
import { FiCheckSquare, FiChevronDown, FiSliders, FiSquare } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import {
  DynamicWidgets,
  useClearRefinements,
  useCurrentRefinements,
  useHierarchicalMenu,
  useRange,
  useRefinementList,
} from "react-instantsearch";

import { filterIcons } from "../Icons";
import {
  ATTRIBUTE_LABELS,
  CATEGORY_ATTRIBUTES,
  METAL_SWATCHES,
  RANGE_FILTERS,
  REFINEMENT_FILTERS,
} from "./config";

// Collapsible filter group, styled like the Commerce PLP's FilterGroup.
function Panel({ title, activeCount = 0, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#d7b89c] py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-filter lg:font-semibold">
            {title}
          </span>
          {activeCount > 0 && (
            <span className="rounded bg-[#f1e3d2] px-2 text-[10px] text-brand-filter">{activeCount}</span>
          )}
        </span>
        <FiChevronDown className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function CategoryList({ items, refine, depth = 0 }) {
  return (
    <ul className={`space-y-2 ${depth ? "mt-2 pl-4" : ""}`}>
      {items.map((item) => (
        <li key={item.value}>
          <button
            type="button"
            onClick={() => refine(item.value)}
            className={`flex w-full justify-between text-sm hover:text-brand-filter ${
              item.isRefined ? "font-semibold text-brand-filter" : ""
            }`}
          >
            <span>{item.label}</span>
            <span className="text-xs text-gray-500">{item.count}</span>
          </button>
          {item.data && <CategoryList items={item.data} refine={refine} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

// Defined once (not inline) so the widget doesn't remount on every render.
const CATEGORY_SORT = ["count:desc"];

// All-products page: the whole category tree. Category page: only its
// sub-categories (rootPath = the page's category).
function CategoryPanel({ category }) {
  const { items, refine } = useHierarchicalMenu({
    attributes: CATEGORY_ATTRIBUTES,
    rootPath: category,
    limit: 20,
    sortBy: CATEGORY_SORT,
  });
  if (!items.length) return null;
  return (
    <Panel
      title={category ? "Style" : "Category"}
      activeCount={items.some((item) => item.isRefined) ? 1 : 0}
    >
      <CategoryList items={items} refine={refine} />
    </Panel>
  );
}

// No sortBy: the value order comes from the index's facetOrdering (dynamic facets).
function RefinementPanel({ attribute, title, swatch, labels = {} }) {
  const { items, refine, canToggleShowMore, isShowingMore, toggleShowMore } = useRefinementList({
    attribute,
    limit: 6,
    showMore: true,
    showMoreLimit: 30,
  });
  if (!items.length) return null;

  return (
    <Panel title={title} activeCount={items.filter((item) => item.isRefined).length}>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = filterIcons[item.label];
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => refine(item.value)}
              className="flex w-full items-center gap-3 hover:text-brand-filter"
            >
              {item.isRefined ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
              {swatch && (
                <span
                  className="h-4 w-4 rounded-full border border-[#e5e5e5]"
                  style={{ background: METAL_SWATCHES[item.label] ?? "#ccc" }}
                />
              )}
              {Icon && <Icon size={18} className="text-brand-filter" />}
              <span className="flex-1 text-left text-sm">{labels[item.label] ?? item.label}</span>
              <span className="text-xs text-gray-500">{item.count}</span>
            </button>
          );
        })}
      </div>
      {canToggleShowMore && (
        <button
          type="button"
          onClick={toggleShowMore}
          className="mt-3 text-xs text-brand-filter underline"
        >
          {isShowingMore ? "View Less" : "View More"}
        </button>
      )}
    </Panel>
  );
}

// Min/max inputs. Mounted even when collapsed: the search box's parsed
// "under £1500" / "1 carat" ranges only apply while a range widget exists.
function RangePanel({ attribute, title, prefix = "", suffix = "", step }) {
  const { start, range, canRefine, refine } = useRange({ attribute });
  const min = Number.isFinite(start[0]) ? start[0] : "";
  const max = Number.isFinite(start[1]) ? start[1] : "";
  const [values, setValues] = useState({ min, max });
  // Follow outside changes (search box, chips, clear all): reset the inputs
  // while rendering when the applied range changes.
  const applied = `${min}:${max}`;
  const [shownFor, setShownFor] = useState(applied);
  if (shownFor !== applied) {
    setShownFor(applied);
    setValues({ min, max });
  }
  if (!canRefine) return null;

  const apply = (event) => {
    event.preventDefault();
    refine([
      values.min === "" ? undefined : Number(values.min),
      values.max === "" ? undefined : Number(values.max),
    ]);
  };

  return (
    <Panel title={title} activeCount={min !== "" || max !== "" ? 1 : 0}>
      <form onSubmit={apply} className="flex items-center gap-2">
        {["min", "max"].map((key) => (
          <label
            key={key}
            className="flex flex-1 items-center gap-1 border border-[#d7b89c] bg-white px-2 py-1 text-sm"
          >
            {prefix && <span className="text-gray-500">{prefix}</span>}
            <input
              type="number"
              step={step}
              min={range.min}
              max={range.max}
              placeholder={String(key === "min" ? range.min : range.max)}
              value={values[key]}
              onChange={(event) => setValues({ ...values, [key]: event.target.value })}
              aria-label={`${title} ${key}`}
              className="w-full min-w-0 bg-transparent outline-none"
            />
            {suffix && <span className="text-gray-500">{suffix}</span>}
          </label>
        ))}
        <button
          type="submit"
          className="bg-brand-filter px-3 py-1 text-xs font-semibold uppercase text-white"
        >
          Go
        </button>
      </form>
    </Panel>
  );
}

function chipLabel(attribute, refinement) {
  const name = ATTRIBUTE_LABELS[attribute] ?? attribute;
  if (refinement.type === "numeric") return `${name} ${refinement.operator} ${refinement.value}`;
  if (refinement.type === "hierarchical") return refinement.label.split(" > ").pop();
  return { Female: "Women", Male: "Men" }[refinement.label] ?? refinement.label;
}

function ActiveFilters({ onClose }) {
  const { items, refine } = useCurrentRefinements();
  const { refine: clearAll, canRefine } = useClearRefinements();
  const chips = items.flatMap((item) =>
    item.refinements.map((refinement) => ({
      refinement,
      key: `${item.attribute}-${refinement.label}-${refinement.operator ?? ""}`,
      text: chipLabel(item.attribute, refinement),
    })),
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-brand-filter">
          <FiSliders />
          <span>Filters</span>
        </div>
        {canRefine && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs uppercase text-brand-filter underline"
          >
            Clear All
          </button>
        )}
        <button type="button" onClick={onClose} className="lg:hidden" aria-label="Close filters">
          <IoClose size={24} />
        </button>
      </div>
      {chips.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {chips.map(({ key, text, refinement }) => (
            <button
              key={key}
              type="button"
              onClick={() => refine(refinement)}
              className="flex items-center gap-1 bg-[#f1e3d2] px-2 py-1 text-xs"
            >
              {text}
              <IoClose size={14} className="text-[#7b5d3c]" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// The filter sidebar. On mobile it's a full-screen sheet (`open`), on desktop
// a column; it's rendered once so every widget is mounted only once.
export default function AlgoliaFilters({ category, subCategory, open, onClose, width = 280 }) {
  return (
    <aside
      style={{ "--filters-width": `${width}px` }}
      className={`${
        open ? "fixed inset-0 z-60 overflow-y-auto bg-white p-5" : "hidden"
      } lg:static lg:block lg:w-(--filters-width) lg:shrink-0 lg:p-0`}
    >
      <ActiveFilters onClose={onClose} />
      {/* A sub-category page has nothing below it to pick. */}
      {!subCategory && <CategoryPanel category={category} />}
      {/* Algolia decides which of these render and in what order (index settings / category rules) */}
      <DynamicWidgets facets={["*"]}>
        {REFINEMENT_FILTERS.map((filter) => (
          <RefinementPanel key={filter.attribute} {...filter} />
        ))}
      </DynamicWidgets>
      {RANGE_FILTERS.map((filter) => (
        <RangePanel key={filter.attribute} {...filter} />
      ))}
      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full bg-brand-primary py-3 text-sm font-medium text-white lg:hidden"
      >
        Show results
      </button>
    </aside>
  );
}
