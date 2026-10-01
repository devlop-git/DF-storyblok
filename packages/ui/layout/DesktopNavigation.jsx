import Link from "next/link";
import { FaAngleDown } from "react-icons/fa";
import { categoryName, slugify } from "@df/core/utils/slugify";

export default function DesktopNavigation({ navigation = [] }) {
  if (!navigation?.length) return null;

  return (
    <nav className="hidden h-10 items-center justify-center lg:flex">
      <ul className="flex items-center">
        {navigation.map((category) => {
          const { category_id, children = [] } = category;
          const parentName = categoryName(category);

          return (
            <li key={category_id} className="group relative">
              {/* Parent Category: menu grouping only, not a real PLP page
                  (isLastLevel: false), so it's a hover trigger, not a link. */}
              <span className="flex h-10 items-center gap-1 px-5 text-[13px] font-medium uppercase tracking-wide text-[#111] transition-colors group-hover:text-brand-primary">
                {parentName}

                {children.length > 0 && (
                  <FaAngleDown size={11} className="mt-px" />
                )}
              </span>

              {/* Mega-menu panel: a "STYLE" column listing this category's
                  subcategories (getSubCategories in services/commerce.js). */}
              {children.length > 0 && (
                <div
                  className="
                    invisible
                    absolute
                    left-1/2
                    top-full
                    z-50
                    w-130
                    max-w-[calc(100vw-2rem)]
                    -translate-x-1/2
                    translate-y-2
                    border
                    border-[#ECE6DE]
                    bg-white
                    opacity-0
                    shadow-2xl
                    transition-all
                    duration-300
                    group-hover:visible
                    group-hover:translate-y-0
                    group-hover:opacity-100
                  "
                >
                  <div className="px-8 py-6">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-brand-primary">
                      STYLE
                    </p>
                    <ul className="grid grid-cols-3 gap-x-8 gap-y-4">
                      {children.map((subCategory) => {
                        const subCategoryName = categoryName(subCategory, "Sub Category");

                        return (
                          <li key={subCategory.category_id}>
                            <Link
                              href={`/${slugify(parentName)}/${slugify(subCategoryName)}`}
                              className="text-sm text-gray-700 transition-colors hover:text-brand-primary"
                            >
                              {subCategoryName}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
