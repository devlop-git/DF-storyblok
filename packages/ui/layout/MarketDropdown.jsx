"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { brand } from "@brand/config";
import countryCodes from "@df/core/lib/countryCodes";

// Per brand (apps/<brand>/brand/config.js -> shopFromMarkets). Each needs an entry in
// `countryCodes` (src/lib/countryCodes.js) for its flag to render.
const MARKETS = brand.shopFromMarkets;

const MarketDropdown = ({ market }) => {
  const [isOpen, setIsOpen] = useState(false);
  const marketFlagCode = countryCodes[market];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-gray-300"
      >
        <span className="flex items-center gap-2">
          You&apos;re in:
          {marketFlagCode && (
            <span className={`fi fi-${marketFlagCode} rounded-sm`} />
          )}
          {market}
        </span>
        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-full mt-2 w-40 bg-white text-gray-900 rounded-md shadow-lg py-2 z-10 max-h-56 overflow-y-auto">
          {MARKETS.map((code) => (
            <li
              key={code}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span className={`fi fi-${countryCodes[code]} rounded-sm`} />
              {code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MarketDropdown;
