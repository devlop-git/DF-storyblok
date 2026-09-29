"use client";

import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";

// Appears once the shopper scrolls the main Price block out of view (see the
// scroll listener in PdpDetails.jsx). Fixed above the site Header (higher
// z-index), so it overlays rather than stacking below it while visible.
export default function PdpStickyBanner({
  visible,
  currency,
  bomDetails,
  priceInformation,
  salePrice,
}) {
  if (!visible) return null;

  const priceBeforeDiscount = priceInformation?.priceBeforeDiscount;
  const centerStone =
    bomDetails?.stoneGroups?.find((group) => group.role === "Center") ??
    bomDetails?.stoneGroups?.[0];
  const stoneLabel = centerStone
    ? `${Number(centerStone.totalWeightCt ?? 0).toFixed(2)} ${centerStone.shape ?? ""}`.trim()
    : "";

  return (
    <div className="fixed top-0 left-0 right-0 z-60 border-b border-[#E8DDCF] bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 lg:gap-6 lg:px-10">
        {/* Price breakdown: Setting + Diamond = subtotal */}
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-6 text-sm lg:text-sm">
            <div className="w-32.5 text-center leading-tight">
              <div className="font-semibold text-[#1F1F1F]">
                {formatPrice(priceBeforeDiscount?.metal, currency)}
              </div>
              <div className="text-lg">Setting</div>
              {bomDetails?.metal && (
                <div className="hidden text-[14px] text-[#9A8B78] md:block">
                  ({bomDetails.metal})
                </div>
              )}
            </div>

            <span className="pt-1 text-[#9A8B78]">+</span>

            <div className="w-32.5 text-center leading-tight">
              <div className="font-semibold text-[#1F1F1F]">
                {formatPrice(priceBeforeDiscount?.stones, currency)}
              </div>
              <div className="text-lg">Diamond</div>
              {stoneLabel && (
                <div className="hidden text-[14px] text-[#9A8B78] md:block">
                  ({stoneLabel})
                </div>
              )}
            </div>

            <span className="pt-1 text-[#9A8B78]">=</span>

            <span className="bg-[#9C6D4B]/10 px-2 py-1 font-semibold text-[#1F1F1F]">
              {formatPrice(priceBeforeDiscount?.subtotal, currency)}
            </span>
          </div>

          <p className="hidden text-sm md:block">
            Best Price &amp; Quality Guaranteed.{" "}
            <Link href="https://www.diamondsfactory.de/#priceexplaincontent" className="underline">
              Find out More
            </Link>
          </p>
        </div>

        {/* Sale price -- stacked block on mobile, inline label from tablet (md) up */}
        <div className="text-center md:hidden">
          <div className="text-lg font-semibold text-[#9C6D4B]">
            {formatPrice(salePrice, currency)}
          </div>
          <div className="text-sm text-[#9C6D4B]">Sale Price</div>
        </div>
        <div className="hidden text-lg font-['Lucida_Bright',sans-serif] md:block">
          <span className="text-[#9C6D4B]">Sale Price: </span>
          <span className="font-semibold text-[#9C6D4B]">
            {formatPrice(salePrice, currency)}
          </span>
        </div>

        {/* Actions -- hidden on mobile, shown from tablet (md) up */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="whitespace-nowrap bg-[#9C6D4B] px-4 py-4 text-sm font-semibold uppercase text-white transition-colors hover:bg-[#835a3d] lg:px-6"
          >
            Add to Bag ({formatPrice(salePrice, currency)})
          </button>
          <button
            type="button"
            className="whitespace-nowrap border border-[#9C6D4B] px-6 py-3 text-sm font-semibold text-[#9C6D4B] transition-colors hover:bg-[#9C6D4B] hover:text-white"
          >
            Request An Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
