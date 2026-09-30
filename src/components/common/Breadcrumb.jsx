import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb({ items }) {
  if (!items?.length) return null;

  const parentItems = items.slice(0, -1);
  const lastItem = items[items.length - 1];

  const renderCrumb = (item) =>
    item?.url ? (
      <Link
        href={item.url || "#"}
        className="text-[#1F1F1F] transition hover:text-brand-accent"
      >
        {item.label}
      </Link>
    ) : (
      <span className="text-[#1F1F1F]">{item.label}</span>
    );

  return (
    <section className=" bg-white">
      <div className="mx-auto lg:max-w-7xl  py-5 px-2 md:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="text-sm md:text-base">
          {/* Parent trail: wraps as a group; on desktop the final crumb
              joins this same line, on mobile it drops to its own line
              below instead of breaking mid-label. */}
          <div className="flex flex-wrap items-center">
            {parentItems.map((item) => (
              <div key={item.label} className="flex items-center whitespace-nowrap">
                {renderCrumb(item)}
                <FiChevronRight
                  className="mx-1 md:mx-2 lg:mx-3 text-[#4A4A4A]"
                  size={14}
                />
              </div>
            ))}

            <span className="hidden lg:inline font-medium text-[#1F1F1F] whitespace-nowrap">
              {lastItem.label}
            </span>
          </div>

          <div className="mt-1 font-medium text-[#1F1F1F] lg:hidden">
            {lastItem.label}
          </div>
        </nav>
      </div>
    </section>
  );
}
