"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Highlight } from "react-instantsearch";

import { METAL_SWATCHES, formatPrice, pdpHref } from "./config";

// Our PDP (same tab) for designs it supports, else the live product page (new tab).
function ProductLink({ hit, className, children }) {
  const href = pdpHref(hit);
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={hit.url} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

// One card per design; `hit` is the variant Algolia picked to represent it
// (the one matching the selected filters, via optionalFilters).
export default function AlgoliaProductCard({ hit }) {
  const [liked, setLiked] = useState(false);
  const hoverImage = hit.additional_images?.[0];
  const specLine = [
    hit.carat && `${hit.caratApprox ? "~" : ""}${hit.carat} ct`,
    hit.shape?.join(" & "),
    hit.stoneType,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group">
      <ProductLink hit={hit} className="block">
        <article className="relative overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg">
          {hit.onSale && hit.discountPercent > 0 && (
            <span className="absolute left-3 top-3 z-10 bg-brand-primary px-3 text-xs font-semibold text-white">
              {hit.discountPercent}% OFF
            </span>
          )}

          {hit.image && (
            <div className="relative">
              <Image
                src={hit.image}
                alt={hit.title}
                width={500}
                height={500}
                unoptimized
                className="h-[300px] w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={hit.title}
                  fill
                  unoptimized
                  className="hidden object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
                />
              )}
            </div>
          )}
        </article>
      </ProductLink>

      <div className="pt-4">
        <div className="flex flex-col items-start justify-between gap-2 lg:flex-row lg:gap-4">
          <div>
            <ProductLink
              hit={hit}
              className="line-clamp-2 text-[12px] font-normal leading-4 text-gray-800 lg:leading-5"
            >
              <Highlight attribute="title" hit={hit} />
            </ProductLink>
            {specLine && <p className="mt-1 text-[11px] text-gray-500">{specLine}</p>}
          </div>
          <p className="text-[12px] font-normal leading-5 text-gray-800">
            From
            <span className="ml-1 whitespace-nowrap text-[13px] font-semibold text-black">
              {formatPrice(hit.fromPrice, hit.currency)}
            </span>
          </p>
        </div>

        {hit.metalColours?.length > 0 && (
          <ul className="mt-4 flex items-center gap-3">
            {hit.metalColours.map((colour) => {
              const current = hit.metalColour?.includes(colour);
              return (
                <li
                  key={colour}
                  title={colour}
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    current ? "border-2 border-brand-pdp" : ""
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 30% 25%, #ffffff 0%, ${
                        METAL_SWATCHES[colour] ?? "#ccc"
                      } 45%, #cfcfcd 100%)`,
                    }}
                  />
                </li>
              );
            })}
            <li className="ml-auto">
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              >
                {liked ? (
                  <FaHeart size={18} className="text-brand-pdp" />
                ) : (
                  <FaRegHeart size={18} className="text-brand-muted" />
                )}
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
