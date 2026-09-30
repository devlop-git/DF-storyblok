"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { brand } from "@/brands";

// Texts come from the brand config (src/brands/*.js -> announcement).
// An item with `strong` renders it bold before its `text` (e.g. a rating).
export default function TopAnnouncementBar({ headerTextStyle }) {
  const [showNavbar, setShowNavbar] = useState(true);
  const { mobileLink, items } = brand.announcement;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showNavbar) return null;

  return (
    <section className="w-full max-w-full overflow-hidden bg-[#1A1A18] text-white">
      {/* Mobile */}
      <div className="min-h-10 flex justify-center items-center lg:hidden">
        <Link
          href={mobileLink.href}
          className={`hover:underline text-base ${headerTextStyle}`}
        >
          {mobileLink.label}
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex w-full h-14 items-center overflow-hidden">
        <div className="flex w-full min-w-0 items-center justify-between text-sm font-medium">
          {items.map((item) =>
            item.strong ? (
              <div key={item.strong} className="flex min-w-0 items-center gap-2 px-2 xl:px-4">
                <span className="whitespace-nowrap text-[15px] xl:text-[17px] font-bold">
                  {item.strong}
                </span>
                <span className="whitespace-nowrap text-[15px] xl:text-[17px]">
                  {item.text}
                </span>
              </div>
            ) : (
              <div
                key={item.text}
                className="shrink-0 px-2 xl:px-4 uppercase tracking-wide whitespace-nowrap"
              >
                {item.text}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
