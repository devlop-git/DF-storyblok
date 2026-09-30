"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaRegHeart } from "react-icons/fa";
import DotIndicatorButton from "@/components/common/DotIndicatorButton";
import { buildSkuFromFeatures } from "@/utils/buildSku";
import { withCurrency } from "@/utils/formatPrice";

export default function ProductCard({ product, filters }) {
  // Hooks must run before any early return (the Strapi version returned first).
  const [hoveredMetal, setHoveredMetal] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  const images = [product.image?.medium, product.image?.hover].filter(Boolean);

  const metalFilter = filters?.find((f) => f.featureId === "FEATURE-METAL");

  const availableMetals = product.availableValues?.["FEATURE-METAL"] || [];

  const selectedMetal = product.defaultSelection?.["FEATURE-METAL"];
  const discount = Math.round(
    ((product.priceFrom?.listPrice - product.priceFrom?.salePrice) /
      product.priceFrom?.listPrice) *
      100,
  );

  // The PLP API returns `sku: null`, so build the default configuration's SKU
  // from designRef + defaultSelection (the helper the Strapi code had but never used).
  const sku =
    product.sku ||
    (product.designRef && buildSkuFromFeatures(product.designRef, product.defaultSelection));
  const pdpHref = product.slug && sku ? `/design/${product.slug}/${sku}` : "#";

  return (
    <Link href={pdpHref} className="group">
      <article className="bg-white transition-all duration-300 shadow-md hover:shadow-lg ">
        {/* Image */}
        <div className="relative overflow-hidden">
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-brand-primary px-3 text-xs font-semibold text-white">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist */}
          <button className="absolute top-3 right-3 z-10">
            <FaRegHeart size={22} className="text-brand-muted" />
          </button>

          {/* Desktop Images */}
          <div className="relative hidden lg:block">
            <Image
              src={product.image.thumbnail}
              alt={product.image.altText}
              width={500}
              height={500}
              unoptimized
              className="h-[300px] w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {product.image.hover && (
              <Image
                src={product.image.hover}
                alt={product.image.altText}
                fill
                unoptimized
                className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </div>

          {/* Mobile Image */}
          <div className="lg:hidden">
            <Image
              src={product.image.thumbnail}
              alt={product.image.altText}
              width={500}
              height={500}
              unoptimized
              className="w-full object-contain"
            />
          </div>

          {/* Mobile Dots */}
          {images.length > 1 && (
            <div className=" flex absolute  left-1/2 bottom-[5%] -translate-x-1/2 justify-center gap-3 lg:hidden">
              {images.map((_, index) => (
                <DotIndicatorButton
                  key={index}
                  active={activeImage === index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImage(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </article>
      {/* Details */}
      <div className="pt-4">
        <div className="flex lg:flex-row flex-col justify-between items-start gap-4">
          <h3 className="text-[12px] line-clamp-2 text-gray-800 leading-4 lg:leading-5 font-normal">
            {product.name}
          </h3>

          <p className="text-[12px] font-normal leading-5 text-gray-800">
            From
            <span className="ml-1 whitespace-nowrap text-[13px] font-semibold text-black">
              {withCurrency(product.priceFrom?.salePrice, product.priceFrom?.currency)}
            </span>
          </p>
        </div>

        {/* Metal Options */}
        <div className="mt-5 flex items-center gap-3">
          {availableMetals.map((valueCode) => {
            const metal = metalFilter?.values.find(
              (item) => item.valueCode === valueCode,
            );

            if (!metal) return null;

            const selected = selectedMetal === valueCode;

            return (
              <div
                key={valueCode}
                className="relative"
                onMouseEnter={() => setHoveredMetal(valueCode)}
                onMouseLeave={() => setHoveredMetal(null)}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    selected ? "border-2 border-brand-pdp" : ""
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border-white"
                    style={{
                      background: `
                        radial-gradient(
                          circle at 30% 25%,
                          #ffffff 0%,
                          ${metal.swatch} 45%,
                          #cfcfcd 100%
                        )
                      `,
                    }}
                  />
                </div>

                <span
                  className={`absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-xs shadow transition-all duration-200 ${
                    hoveredMetal === valueCode
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  }`}
                >
                  {metal.displayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
