"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { LuTruck } from "react-icons/lu";
import { RiShieldCheckLine } from "react-icons/ri";
import OutlineButton from "@/components/common/OutlineButton";
import PendingOverlay from "@/components/common/PendingOverlay";
import PdpConfigurator from "./PdpConfigurator";
import PdpProductDetails from "./PdpProductDetails";
import PdpInStockTable from "./PdpInStockTable";
import PdpStickyBanner from "./PdpStickyBanner";
import { brand } from "@/brands";
import { buildSku, initialSelections } from "@/utils/buildSku";
import { formatPrice } from "@/utils/formatPrice";

// Rendered with a `key` of sku + locale (see PdpProduct), so new server data
// for the page -- e.g. a language switch -- remounts this with fresh props
// instead of syncing props into state in an effect.
export default function PdpDetails({
  basicDetails,
  priceInformation,
  options,
  meta,
  bomDetails,
  inStockProducts,
}) {
  const [pdpData, setPdpData] = useState({
    basicDetails,
    priceInformation,
    bomDetails,
    inStockProducts,
  });

  // True while an option-change fetch is in flight.
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customise");
  // Ignores responses from older clicks that arrive after a newer one.
  const requestId = useRef(0);

  // Sticky price banner: visible once the main Price block below has
  // scrolled out of view, hidden again once it's back in view.
  const priceRef = useRef(null);
  const [priceOutOfView, setPriceOutOfView] = useState(false);

  useEffect(() => {
    const target = priceRef.current;
    if (!target) return;

    // A plain scroll listener (rather than IntersectionObserver) so the
    // check runs continuously while scrolling, not only when the price row
    // crosses the viewport edge.
    let ticking = false;
    const checkPosition = () => {
      ticking = false;
      setPriceOutOfView(target.getBoundingClientRect().top < 0);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(checkPosition);
    };

    const initial = requestAnimationFrame(checkPosition);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Single source of truth for every option the shopper has chosen so far.
  const [selections, setSelections] = useState(() =>
    initialSelections(options),
  );

  const sku = buildSku(options, meta?.designReference, selections);

  // Option click: update the selection, then fetch that configuration's
  // price/details through the /api/pdp proxy and update the URL in place.
  const selectOption = async (option, valueCode) => {
    const next = { ...selections, [option.name]: valueCode };
    setSelections(next);

    const nextSku = buildSku(options, meta?.designReference, next);
    if (!meta?.slug || nextSku === sku) return;

    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pdp/${meta.slug}/${nextSku}?language=${meta.locale}`);
      if (!res.ok) throw new Error(`PDP ${res.status}`);
      const { data } = await res.json();
      if (id !== requestId.current) return;
      setPdpData({
        basicDetails: data.basicDetails,
        priceInformation: data.priceInformation,
        bomDetails: data.bomDetails,
        inStockProducts: data.inStockProducts,
      });
      window.history.replaceState(null, "", `/design/${meta.slug}/${nextSku}`);
    } catch (error) {
      console.error("PDP option change:", error.message);
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  };

  const currency = pdpData.priceInformation?.currency;
  const salePrice = pdpData.priceInformation?.totalPrice;
  const listPrice = pdpData.priceInformation?.listPrice;
  const promotion = pdpData.priceInformation?.promotion;
  const onSale = listPrice > salePrice;

  const title =
    pdpData.basicDetails?.name ||
    `${pdpData.basicDetails?.subCategory ?? ""} ${pdpData.basicDetails?.category ?? ""}`.trim();
  const productCode = (
    pdpData.basicDetails?.productCode ||
    meta?.slug ||
    ""
  ).toUpperCase();

  return (
    <div className="space-y-5 p-4 bg-[#FAF7F2]">
      <PendingOverlay visible={isLoading} />

      <PdpStickyBanner
        visible={priceOutOfView && activeTab === "customise"}
        currency={currency}
        bomDetails={pdpData.bomDetails}
        priceInformation={pdpData.priceInformation}
        salePrice={salePrice}
      />

      {/* Title + code */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#1F1F1F]">{title}</h1>
        {productCode && (
          <span className="whitespace-nowrap pt-2 text-xs text-gray-900">
            Product Code: {productCode}
          </span>
        )}
      </div>

      {/* Price */}
      {salePrice ? (
        <div ref={priceRef} className="flex items-baseline gap-3 mb-2">
          <span className="text-xl font-semibold text-brand-pdp">
            {formatPrice(salePrice, currency)}
          </span>
          {onSale && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(listPrice, currency)}
            </span>
          )}
          {onSale && <span className="text-xs text-brand-pdp">Sale Price</span>}
        </div>
      ) : (
        <div className="text-xs text-[#e72618]">
          Please contact a member of our sales team regarding your combination. We would be delighted to help you. Our team can be contacted on {brand.phone}.
        </div>
      )}

      {/* Promotion banner */}
      {promotion?.description && (
        <div className="bg-brand-pdp px-4 py-3 text-center text-white">
          <p className="text-sm font-medium">{promotion.description}</p>
          <p className="text-[11px] underline">*T&amp;C&apos;s Apply</p>
        </div>
      )}

      {/* Tabs: switch between the build-your-own configurator and the
          ready-to-ship "In-Stock Products" table below. */}
      <div className="flex gap-8 border-b border-[#E8DDCF] text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("customise")}
          className={`pb-2 ${
            activeTab === "customise"
              ? "border-b-2 border-brand-pdp font-semibold text-[#1F1F1F]"
              : "text-[#9A8B78]"
          }`}
        >
          Customise Your Product
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("inStock")}
          className={`pb-2 ${
            activeTab === "inStock"
              ? "border-b-2 border-brand-pdp font-semibold text-[#1F1F1F]"
              : "text-[#9A8B78]"
          }`}
        >
          In-Stock Products
        </button>
      </div>

      {activeTab === "customise" ? (
        <>
          {/* Configurator: renders option rows, reports clicks via onSelect */}
          <PdpConfigurator
            options={options}
            selections={selections}
            onSelect={selectOption}
            sku={sku}
          />

          {/* Couldn't find the right stone */}
          <button
            type="button"
            className="flex w-full items-center justify-between border border-[#E8DDCF] bg-[#F7F2EB] px-4 py-4 text-left"
          >
            <span>
              <span className="block text-sm font-semibold text-[#1F1F1F]">
                Couldn&apos;t find the right stone?
              </span>
              <span className="block text-xs text-brand-pdp underline">
                Choose a specific diamond
              </span>
            </span>
            <FiChevronDown className="text-brand-muted" />
          </button>

          {/* Add to bag */}
          <button
            type="button"
            className="w-full bg-brand-pdp py-4 text-sm font-semibold uppercase text-white transition-colors hover:bg-brand-pdp-hover"
          >
            Add to Bag ({formatPrice(salePrice, currency)})
          </button>
        </>
      ) : (
        // Pre-configured, ready-to-ship variants: one row = one orderable
        // ornament, each with its own Buy button.
        <PdpInStockTable
          products={pdpData.inStockProducts}
          ringSizeOption={options?.find((o) => o.name === "Ring Size")}
          currency={currency}
        />
      )}

      {/* Appointment buttons */}
      <div className="grid grid-cols-2 gap-4">
        <OutlineButton className="h-[52px] w-full text-sm">
          Request An Appointment
        </OutlineButton>
        <OutlineButton className="h-[52px] w-full text-sm">
          Book A Video Appointment
        </OutlineButton>
      </div>

      {/* Delivery / policies */}
      <div className="space-y-2 pt-2 text-sm">
        <p className="flex items-center gap-2">
          <LuTruck className="text-brand-muted" />
          Estimated Delivery 2-3 working weeks.
        </p>
        <p className="flex items-center gap-2">
          <RiShieldCheckLine className="text-brand-muted" />
          Shipping and Return Policies
        </p>
      </div>

      {/* Product Description + Ring & Diamond Details collapsibles */}
      <PdpProductDetails
        description={pdpData.basicDetails?.description}
        bomDetails={pdpData.bomDetails}
        meta={meta}
        options={options}
        selections={selections}
      />
    </div>
  );
}
