"use client";

// "In-Stock Products" tab: a table of pre-configured, ready-to-ship
// ornaments (as opposed to "Customise Your Product", which builds one to
// order). Each row has its own price and Buy button; expanding a row reveals
// Stone Type, Colour, Clarity, Tag No and Design No.
import { useState } from "react";
import { GiDiamonds } from "react-icons/gi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { formatPrice } from "@df/core/utils/formatPrice";

// Best-effort abbreviation for a metal name, e.g. "18K White Gold" -> "18K".
function metalAbbr(name = "") {
  if (/platinum/i.test(name)) return "PL";
  const karat = name.match(/(\d+)K/i);
  return karat ? `${karat[1]}K` : name.slice(0, 2);
}

function Row({ product, ringSizeValues, currency }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#F0E9DF] first:border-t-0">
      <div className="grid grid-cols-[40px_32px_1fr_1fr_1fr_1fr_auto_24px] items-center gap-3 py-3 text-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5EFE7] text-[9px] font-medium text-[#5A4A38]">
          {metalAbbr(product.metal)}
        </span>

        <GiDiamonds className="text-lg text-[#BCA98F]" title={product.shape} />

        <span>{Number(product.caratWeight ?? 0).toFixed(2)}ct</span>

        {/* The shopper can still pick their own size for an in-stock piece;
            the list reuses the product-wide Ring Size values. */}
        <select
          defaultValue={product.ringSize}
          className="w-fit appearance-none border-none bg-transparent pr-4 text-sm text-[#4A4A4A] focus:outline-none"
        >
          {ringSizeValues.map((v) => (
            <option key={v.valueCode ?? v.valueName} value={v.displayName}>
              {v.displayName}
            </option>
          ))}
        </select>

        <span>{Number(product.bandWidthMm ?? 0).toFixed(2)}mm</span>

        <span className="font-medium text-[#1F1F1F]">
          {formatPrice(product.price, currency)}
        </span>

        <button
          type="button"
          className="bg-brand-pdp px-5 py-2 text-xs font-semibold uppercase text-white hover:bg-brand-pdp-hover"
        >
          Buy
        </button>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Hide details" : "Show details"}
          className="flex items-center justify-center text-brand-muted"
        >
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 border-t border-[#F0E9DF] py-3 text-sm">
          <p>
            <span className="text-brand-pdp">Stone Type: </span>
            {product.stoneType}
          </p>
          <p>
            <span className="text-brand-pdp">Metal: </span>
            {product.metal}
          </p>
          <p>
            <span className="text-brand-pdp">Clarity: </span>
            {product.clarity}
          </p>
          <p>
            <span className="text-brand-pdp">Colour: </span>
            {product.colour}
          </p>
          <p>
            <span className="text-brand-pdp">Tag No: </span>
            {product.tagNo}
          </p>
          <p>
            <span className="text-brand-pdp">Design Number: </span>
            {product.designNumber}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PdpInStockTable({
  products,
  ringSizeOption,
  currency,
}) {
  if (!products?.length) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        No in-stock variants available for this design right now.
      </p>
    );
  }

  const ringSizeValues = ringSizeOption?.values ?? [];

  return (
    <div>
      <div className="grid grid-cols-[40px_32px_1fr_1fr_1fr_1fr_auto_24px] gap-3 pb-2 text-xs font-medium text-[#4A4A4A]">
        <span>Metal</span>
        <span>Shape</span>
        <span>Carat</span>
        <span>Ring Size</span>
        <span>Band Width</span>
        <span>Price</span>
        <span />
        <span />
      </div>

      {products.map((product) => (
        <Row
          key={product.tagNo ?? product.designRef}
          product={product}
          ringSizeValues={ringSizeValues}
          currency={currency}
        />
      ))}
    </div>
  );
}
