"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { FaRegHeart, FaRegPlayCircle } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";

// Renders a single media item (image or video) at a given size.
function Media({ item, className, isMain = false }) {
  if (item?.type === "video") {
    if (isMain) {
      return (
        <video
          src={item.path}
          poster={item.thumbnail}
          controls
          playsInline
          className={className}
        />
      );
    }
    // Video thumbnail inside a strip: poster image + play badge.
    return (
      <div className="relative h-full w-full">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt="Video"
            fill
            unoptimized
            className="object-contain"
          />
        ) : (
          <div className="h-full w-full bg-[#EFE9E1]" />
        )}
        <FaRegPlayCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-white/90" />
      </div>
    );
  }

  if (!item?.path) return null;

  return (
    <Image
      src={item.path}
      alt="Product view"
      width={600}
      height={600}
      unoptimized
      className={className}
    />
  );
}

export default function PdpGallery({ galleryGroups = [], caption }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeItem, setActiveItem] = useState(0);

  const groups = galleryGroups ?? [];
  if (!groups.length) return null;

  const items = groups[activeGroup]?.items ?? [];
  const current = items[activeItem] ?? items[0];

  const selectGroup = (index) => {
    setActiveGroup(index);
    setActiveItem(0); // reset to the first item of the newly selected group
  };

  const step = (dir) => {
    if (!items.length) return;
    setActiveItem((prev) => (prev + dir + items.length) % items.length);
  };

  return (
    <div className="flex gap-4">
      {/* Left: vertical group thumbnails */}
      <div className="hidden w-[70px] shrink-0 flex-col items-center gap-2 lg:flex">
        <FiChevronUp className="text-brand-muted" />
        <div className="flex flex-col gap-2">
          {groups.map((group, index) => (
            <button
              key={group.groupId ?? index}
              type="button"
              onClick={() => selectGroup(index)}
              aria-label={`View group ${index + 1}`}
              className={`relative h-[58px] w-[58px] overflow-hidden border transition-colors ${
                activeGroup === index
                  ? "border-brand-pdp"
                  : "border-transparent hover:border-[#D8C7B4]"
              }`}
            >
              <Media
                item={group.thumbnail}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        <FiChevronDown className="text-brand-muted" />
      </div>

      {/* Center: main viewer + bottom strip */}
      <div className="flex-1">
        <div className="relative flex items-center justify-center bg-white">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="absolute left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-brand-muted hover:bg-[#F5EFE7]"
          >
            <FiChevronLeft size={22} />
          </button>

          <div className="flex h-[360px] w-full items-center justify-center">
            {current && (
              <Media
                item={current}
                isMain
                className="h-[360px] w-auto max-w-full object-contain"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="absolute right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-brand-muted hover:bg-[#F5EFE7]"
          >
            <FiChevronRight size={22} />
          </button>
        </div>

        {/* Caption + actions */}
        <div className="mt-2 flex flex-col items-center gap-3">
          {caption && (
            <p className="text-center text-xs text-gray-500">{caption}</p>
          )}
          <div className="flex items-center gap-6 text-brand-muted">
            <button type="button" aria-label="Add to wishlist">
              <FaRegHeart size={18} />
            </button>
            <button type="button" aria-label="Share">
              <RiShareForwardLine size={18} />
            </button>
          </div>
        </div>

        {/* Bottom: horizontal item strip for the selected group */}
        <div className="mt-4 flex justify-center gap-3">
          {items.map((item, index) => (
            <button
              key={`${groups[activeGroup].groupId}-${index}`}
              type="button"
              onClick={() => setActiveItem(index)}
              aria-label={`View item ${index + 1}`}
              className={`relative h-[64px] w-[64px] overflow-hidden border transition-colors ${
                activeItem === index
                  ? "border-brand-pdp"
                  : "border-[#E8DDCF] hover:border-[#D8C7B4]"
              }`}
            >
              <Media item={item} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
