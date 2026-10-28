"use client";

import Link from "next/link";
import { useState } from "react";
import { HiBars3, HiXMark, HiChevronLeft } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";
import HeaderTabs from "./HeaderTabs";
import TopAnnouncementBar from "./TopAnnouncementBar";
import LanguageDropdown from "./LanguageDropdown";
import { brand } from "@brand/config";

// `navigation`: the header menu from getMenu() (services/navigation.js) --
// Storyblok "Main Navigation" story, or the PIM categories as fallback.
const hasLinks = (item) => item.columns.some((column) => column.links.length);

export default function MobileNavigation({ navigation = [], languages, locale }) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const openDrawer = () => setOpen(true);

  const closeDrawer = () => {
    setOpen(false);
    setSelectedCategory(null);
  };

  const goBack = () => {
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:relative flex min-h-16 items-center lg:hidden">
        <button onClick={openDrawer} className="p-1" aria-label="Open Menu">
          <HiBars3 className="text-4xl text-[#111]" />
        </button>

        <h2 className="md:absolute md:left-[20%] md:-translate-x-1/2 font-serif text-[12px] tracking-wide">
          {brand.logoText}
        </h2>

        <div className="ml-auto">
          <HeaderTabs />
        </div>
      </div>

      {/* Overlay */}

      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-999 transition-all duration-300 ${
          open ? "visible bg-black/40 opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Drawer */}

        <aside
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0  top-0 h-full w-full  bg-white transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <TopAnnouncementBar headerTextStyle="!text-xs" />

          <div className="flex  items-center justify-between  px-2">
            <button onClick={closeDrawer} aria-label="Close Menu">
              <HiXMark className="text-3xl text-[#111]" />
            </button>

            <h2 className="font-serif text-[14px] tracking-wide">
              {brand.logoText}
            </h2>

            <HeaderTabs />
          </div>

          {/* Navigation */}

          <div className="h-[calc(100%-80px)] overflow-y-auto">
            {/* Parent Categories */}

            {!selectedCategory &&
              navigation.map((item) =>
                // A menu with its own link and no sub-menus (e.g. SALE) navigates directly.
                item.href && !hasLinks(item) ? (
                  <Link
                    key={item.id}
                    {...item.editable}
                    href={item.href}
                    onClick={closeDrawer}
                    className="flex w-full items-center justify-between  px-4 py-4 text-left text-[11px] uppercase tracking-wide transition hover:bg-[#F8F5F1]"
                  >
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    {...item.editable}
                    onClick={() => {
                      if (hasLinks(item)) setSelectedCategory(item);
                    }}
                    className="flex w-full items-center justify-between  px-4 py-4 text-left text-[11px] uppercase tracking-wide transition hover:bg-[#F8F5F1]"
                  >
                    <span>{item.label}</span>

                    {hasLinks(item) && <IoIosArrowForward className="text-2xl" />}
                  </button>
                ),
              )}

            {/* Sub Categories */}

            {selectedCategory && (
              <>
                {/* Back */}

                <button
                  onClick={goBack}
                  className="flex w-full items-center gap-3  px-6 py-6 text-left"
                >
                  <HiChevronLeft className="text-2xl" />

                  <span className="text-[12px] font-medium uppercase text-brand-primary">
                    {selectedCategory.label}
                  </span>
                </button>

                {/* Children */}

                {/* Children, grouped by column when there are several (e.g. STYLE, SHAPE) */}

                {selectedCategory.columns.map((column) => (
                  <div key={column.id} {...column.editable}>
                    {selectedCategory.columns.length > 1 && column.heading && (
                      <p className="px-8 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-brand-primary">
                        {column.heading}
                      </p>
                    )}
                    {column.links.map((link) => (
                      <Link
                        key={link.id}
                        {...link.editable}
                        href={link.href}
                        onClick={closeDrawer}
                        className="flex items-center justify-between  px-8 text-[12px] uppercase transition hover:bg-[#F8F5F1]"
                      >
                        <span>{link.label}</span>

                        <span className="text-4xl font-light">+</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </>
            )}
            <div className="flex items-center justify-center py-4">
              <LanguageDropdown languages={languages} locale={locale} />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
