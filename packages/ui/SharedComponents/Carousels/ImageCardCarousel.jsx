import { richTextToHtml } from "@df/core/utils/richText";
import ImageCardCarouselClient from "./ImageCardCarouselClient";

// Server wrapper: converts the rich-text title to HTML here and passes a plain
// string to the "use client" component that needs Swiper's interactivity.
export default function ImageCardCarousel({ data }) {
  const titleHtml = richTextToHtml(data?.title);

  return <ImageCardCarouselClient data={data} titleHtml={titleHtml} />;
}
