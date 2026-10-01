"use client";

import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import countryCodes from "@df/core/lib/countryCodes";

const DEFAULT_LANGUAGE = "de";

const LanguageDropdown = ({ languages = [], locale }) => {
  const [selected, setSelected] = useState(
    languages.find((lang) => lang.code === locale) || languages[0],
  );
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // The server treats a missing cookie as "de" (see lib/locale.js); write it
  // explicitly on first load so "de" is a real, persisted value from the start.
  useEffect(() => {
    if (Cookies.get("language")) return;
    Cookies.set("language", DEFAULT_LANGUAGE, { expires: 365, path: "/" });
  }, []);

  if (!selected) return null;

  const handleSelect = (lang) => {
    setSelected(lang);
    setOpen(false);

    Cookies.set("language", lang.code, {
      expires: 365,
      path: "/",
    });

    // Re-render server components (header categories etc.) in the new language.
    // The Strapi version also remapped translated page slugs here; that needs
    // Storyblok languages to be set up first.
    router.refresh();
  };

  return (
    <div className="relative" tabIndex={0} onBlur={() => setOpen(false)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium uppercase rounded-md hover:bg-gray-100"
      >
        <span className={`fi fi-${countryCodes[selected.code]} rounded-sm`} />

        <span>{selected.label}</span>

        <FaChevronDown
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 w-44 rounded-lg border bg-white shadow-lg overflow-hidden z-50">
          {languages?.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onMouseDown={() => handleSelect(lang)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left uppercase hover:bg-gray-100 ${
                selected.code === lang.code ? "bg-gray-50 font-semibold" : ""
              }`}
            >
              <span className={`fi fi-${countryCodes[lang.code]} rounded-sm`} />
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
