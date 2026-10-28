import Link from "next/link";
import { FaAngleDown } from "react-icons/fa";

// `navigation`: the header menu from getMenu() (services/navigation.js) --
// Storyblok "Main Navigation" story, or the PIM categories as fallback.
export default function DesktopNavigation({ navigation = [] }) {
  if (!navigation?.length) return null;
  console.log('navigation--',navigation)

  return (
    <nav className="hidden h-10 items-center justify-center lg:flex">
      <ul className="flex items-center">
        {navigation.map((item) => {
          const columns = item.columns.filter((column) => column.links.length);
          const labelClass =
            "flex h-10 items-center gap-1 px-5 text-[13px] font-medium uppercase tracking-wide text-[#111] transition-colors group-hover:text-brand-primary";
          const label = (
            <>
              {item.label}
              {columns.length > 0 && <FaAngleDown size={11} className="mt-px" />}
            </>
          );

          return (
            <li key={item.id} {...item.editable} className="group relative">
              {/* A menu with its own link (e.g. SALE) is a link; otherwise it's
                  only the hover trigger for its mega-menu. */}
              {item.href ? (
                <Link href={item.href} className={labelClass}>
                  {label}
                </Link>
              ) : (
                <span className={labelClass}>{label}</span>
              )}

              {/* Mega-menu panel: one block per column (e.g. STYLE). */}
              {columns.length > 0 && (
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
                  <div className="flex gap-10 px-8 py-6">
                    {columns.map((column) => (
                      <div key={column.id} {...column.editable} className="flex-1">
                        {column.heading && (
                          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-primary">
                            {column.heading}
                          </p>
                        )}
                        <ul
                          className={`grid gap-x-8 gap-y-4 ${
                            columns.length === 1 ? "grid-cols-3" : "grid-cols-1"
                          }`}
                        >
                          {column.links.map((link) => (
                            <li key={link.id} {...link.editable}>
                              <Link
                                href={link.href}
                                className="text-sm text-gray-700 transition-colors hover:text-brand-primary"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
