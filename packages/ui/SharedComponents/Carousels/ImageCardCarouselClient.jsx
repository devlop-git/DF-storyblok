"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import { asset } from "@df/core/utils/storyblok";
import DotIndicatorButton from "@df/ui/common/DotIndicatorButton";

// Generic title + linked-image-card carousel, backed by the `image_card_carousel`
// block with `icon_link_card` items. `cardLabelPosition` ("overlay" | "below")
// and `navStyle` ("dots" | "arrows", with `arrowPosition`: "top-right" |
// "bottom" | "sides") let one component cover both a full-bleed
// photo-card-with-overlay-title look and a plain image-with-label-below look.

function ArrowButton({ direction, onClick }) {
  const Icon = direction === "prev" ? FiChevronLeft : FiChevronRight;

  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous" : "Next"}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D6D0C8] text-[#171717] transition-colors hover:bg-[#F5F3F0]"
    >
      <Icon size={18} />
    </button>
  );
}

function NavArrows({ onPrev, onNext, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ArrowButton direction="prev" onClick={onPrev} />
      <ArrowButton direction="next" onClick={onNext} />
    </div>
  );
}

export default function ImageCardCarouselClient({ data, titleHtml }) {
  const items = data?.guideItem ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const cardLabelPosition = data?.cardLabelPosition || "overlay";
  const navStyle = data?.navStyle || "dots";
  const arrowPosition = data?.arrowPosition || "top-right";

  if (!items.length) return null;

  const goPrev = () => swiperRef.current?.slidePrev();
  const goNext = () => swiperRef.current?.slideNext();

  const isTopRightArrows = navStyle === "arrows" && arrowPosition === "top-right";

  const heading = titleHtml && (
    <div
      className={`font-serif text-3xl font-light text-[#111] sm:text-4xl [&_em]:text-brand-accent ${
        isTopRightArrows ? "text-left" : "text-center"
      }`}
      dangerouslySetInnerHTML={{ __html: titleHtml }}
    />
  );

  const swiper = (
    <Swiper
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      spaceBetween={16}
      slidesPerView={1.4}
      breakpoints={{
        640: { slidesPerView: 2.2, spaceBetween: 20 },
        1024: { slidesPerView: 4, spaceBetween: 24 },
      }}
      onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
    >
      {items.map((item, index) => {
        const desktopImage = asset(item?.desktopMedia);
        const tabletImage = asset(item?.tabMedia);
        const mobileImage = asset(item?.mobileMedia);

        const imageBox =
          cardLabelPosition === "below" ? (
            <div className="relative aspect-square overflow-hidden bg-[#F8F8F8]">
              {desktopImage && (
                <Image
                  src={desktopImage.filename}
                  alt={desktopImage.alt || item.title || ""}
                  fill
                  priority={index === 0}
                  className="hidden object-contain transition-transform duration-500 group-hover:scale-105 lg:block"
                />
              )}

              {tabletImage && (
                <Image
                  src={tabletImage.filename}
                  alt={tabletImage.alt || item.title || ""}
                  fill
                  priority={index === 0}
                  className="hidden object-contain transition-transform duration-500 group-hover:scale-105 md:block lg:hidden"
                />
              )}

              {mobileImage && (
                <Image
                  src={mobileImage.filename}
                  alt={mobileImage.alt || item.title || ""}
                  fill
                  priority={index === 0}
                  className="object-contain transition-transform duration-500 group-hover:scale-105 md:hidden"
                />
              )}
            </div>
          ) : (
            <div className="relative aspect-4/5 overflow-hidden bg-[#F8F8F8]">
              {desktopImage && (
                <Image
                  src={desktopImage.filename}
                  alt={desktopImage.alt || item.title || ""}
                  fill
                  priority={index === 0}
                  className="hidden object-cover transition-transform duration-500 group-hover:scale-105 lg:block"
                />
              )}

              {tabletImage && (
                <Image
                  src={tabletImage.filename}
                  alt={tabletImage.alt || item.title || ""}
                  fill
                  priority={index === 0}
                  className="hidden object-cover transition-transform duration-500 group-hover:scale-105 md:block lg:hidden"
                />
              )}

              {mobileImage && (
                <Image
                  src={mobileImage.filename}
                  alt={mobileImage.alt || item.title || ""}
                  fill
                  priority={index === 0}
                  className="object-cover transition-transform duration-500 group-hover:scale-105 md:hidden"
                />
              )}

              {item.title && (
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-lg text-white">
                  {item.title}
                </span>
              )}
            </div>
          );

        return (
          <SwiperSlide key={item._uid ?? index}>
            <Link href={item.CTAUrl || "#"} className="group">
              {imageBox}

              {cardLabelPosition === "below" && item.title && (
                <span className="mt-3 block text-center text-sm text-[#171717]">
                  {item.title}
                </span>
              )}
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {(heading || isTopRightArrows) && (
          <div className="mb-10 flex items-center justify-between gap-4">
            <div className="flex-1">{heading}</div>

            {isTopRightArrows && <NavArrows onPrev={goPrev} onNext={goNext} />}
          </div>
        )}

        {navStyle === "arrows" && arrowPosition === "sides" ? (
          <div className="flex items-center gap-4">
            <ArrowButton direction="prev" onClick={goPrev} />
            <div className="min-w-0 flex-1">{swiper}</div>
            <ArrowButton direction="next" onClick={goNext} />
          </div>
        ) : (
          swiper
        )}

        {navStyle === "dots" && (
          <div className="mt-8 flex justify-center gap-3">
            {items.map((_, index) => (
              <DotIndicatorButton
                key={index}
                active={activeIndex === index}
                onClick={() => swiperRef.current?.slideTo(index)}
              />
            ))}
          </div>
        )}

        {navStyle === "arrows" && arrowPosition === "bottom" && (
          <div className="mt-8 flex justify-center">
            <NavArrows onPrev={goPrev} onNext={goNext} />
          </div>
        )}
      </div>
    </section>
  );
}
