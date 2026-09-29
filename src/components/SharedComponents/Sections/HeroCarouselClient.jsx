"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { asset, firstAsset } from "@/utils/storyblok";

// Tailwind resets h1–h6 to `font-size: inherit`, so each heading level picked
// in the Storyblok rich-text editor needs its own size. Paragraph text keeps
// the original hero size (h1 matches it).
const TITLE_SIZES = [
  "text-5xl lg:text-7xl [&_p]:m-0",
  "[&_h1]:text-5xl lg:[&_h1]:text-7xl",
  "[&_h2]:text-4xl lg:[&_h2]:text-6xl",
  "[&_h3]:text-4xl lg:[&_h3]:text-5xl",
  "[&_h4]:text-3xl lg:[&_h4]:text-4xl",
  "[&_h5]:text-2xl lg:[&_h5]:text-3xl",
  "[&_h6]:text-xl lg:[&_h6]:text-2xl",
].join(" ");

// Each slide arrives with `titleHtml` (rich text already converted on the
// server by HeroCarousel.jsx) and `titleText` (plain text, used for alt text).
export default function HeroCarouselClient({ slides }) {
  const canLoop = slides.length > 1;
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop={canLoop}
        speed={900}
        autoplay={
          canLoop
            ? {
                delay: 5000,
                disableOnInteraction: false,
              }
            : false
        }
        pagination={{
          clickable: true,
        }}
        className="w-full"
      >
        {slides.map((slide) => {
          const imageForDesktop = firstAsset(slide?.desktopImage);
          const imageForMobile = firstAsset(slide?.mobileImage);
          const imageForTablet = asset(slide?.tabImage);

          return (
            <SwiperSlide key={slide._uid}>
              <div className="relative h-[75vh] min-h-[700px] w-full">
                {/* Background */}
                <div className="absolute inset-0">
                  {/* Mobile */}
                  {imageForMobile && (
                    <Image
                      src={imageForMobile.filename}
                      alt={imageForMobile.alt || slide.titleText}
                      fill
                      priority
                      className="block md:hidden object-cover"
                    />
                  )}

                  {/* Tablet */}
                  {imageForTablet && (
                    <Image
                      src={imageForTablet.filename}
                      alt={imageForTablet.alt || slide.titleText}
                      fill
                      priority
                      className="hidden md:block lg:hidden object-cover"
                    />
                  )}

                  {/* Desktop */}
                  {imageForDesktop && (
                    <Image
                      src={imageForDesktop.filename}
                      alt={imageForDesktop.alt || slide.titleText}
                      fill
                      priority
                      className="hidden lg:block object-cover"
                    />
                  )}
                </div>

                {/* Optional Dark Overlay */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Content */}
                <div className="absolute inset-0">
                  <div className="max-w-7xl mx-auto h-full px-8 lg:px-10 flex items-center">
                    <div className="max-w-lg ml-8 lg:ml-20">
                      {/* Rich text renders <p>/<h*> tags, which can't sit inside an <h2> */}
                      {slide.titleHtml && (
                        <div
                          role="heading"
                          aria-level={2}
                          className={`font-serif text-[#ffffff] font-light leading-tight [&_a]:underline [&_em]:text-[#A0704F] ${TITLE_SIZES}`}
                          dangerouslySetInnerHTML={{ __html: slide.titleHtml }}
                        />
                      )}

                      {slide.subTitle && (
                        <p className="mt-5 text-lg lg:text-2xl text-[#ffffff] ">
                          {slide.subTitle}
                        </p>
                      )}

                      {slide.buttonText && slide.buttonLink && (
                        <Link
                          href={slide.buttonLink}
                          className="inline-flex mt-10 px-10 py-4 bg-[#ffffff] text-[#000000] text-lg transition-all duration-300"
                        >
                          {slide.buttonText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
