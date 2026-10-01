import { richTextToHtml } from "@df/core/utils/richText";
import HeroCarouselClient from "./HeroCarouselClient";

// Server wrapper: the slide title is a Storyblok rich-text field, which has to
// be converted to HTML here and passed down as a string to the "use client"
// carousel (Swiper), the same way ImageCardCarousel handles its title.
export default function HeroCarousel({ data }) {
  const slides = (data?.heroSlides ?? []).map((slide) => {
    const titleHtml = richTextToHtml(slide?.title);
    return {
      ...slide,
      titleHtml,
      titleText: titleHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    };
  });

  return <HeroCarouselClient slides={slides} />;
}
