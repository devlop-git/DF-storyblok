import Link from "next/link";
import { richTextToHtml } from "@/utils/richText";
import { asset } from "@/utils/storyblok";

// Same heading/paragraph/list styles as the Strapi version's custom blocks.
const descriptionClassName =
  "mt-4 [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:text-xl [&_h2]:text-xl [&_h3]:text-xl [&_h1]:leading-tight [&_h2]:leading-tight [&_h3]:leading-tight [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h1]:text-[#1F2937] [&_h2]:text-[#1F2937] [&_h3]:text-[#1F2937] [&_p]:text-base [&_p]:leading-7 [&_p]:text-[#4B4B4B] [&_p]:my-2 [&_blockquote]:italic [&_blockquote]:text-[#4B4B4B] [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:list-inside [&_ol]:list-inside [&_li]:text-[#4B4B4B] [&_li>p]:m-0";

export default function ImageBanner({ data }) {
  const desktopImage = asset(data?.desktopImage);
  const tabletImage = asset(data?.tabImage);
  const mobileImage = asset(data?.mobileImage);
  const anyImage = desktopImage || tabletImage || mobileImage;
  const descriptionHtml = richTextToHtml(data?.description);

  return (
    <section
      className="w-full"
      style={data?.bgColor ? { backgroundColor: data.bgColor } : { backgroundColor: "#FAF7F2" }}
    >
      <div
        className={`flex flex-col md:flex-row ${
          data?.imagePosition === "right" ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Image */}
        <div className="w-full md:w-1/2">
          <picture>
            {desktopImage && (
              <source media="(min-width:1024px)" srcSet={desktopImage.filename} />
            )}

            {tabletImage && (
              <source media="(min-width:768px)" srcSet={tabletImage.filename} />
            )}

            {anyImage && (
              <img
                src={(mobileImage || tabletImage || desktopImage).filename}
                alt={anyImage.alt || data?.title}
                className="block h-auto w-full"
              />
            )}
          </picture>
        </div>

        {/* Content */}
        <div className="flex w-full flex-col justify-center px-6 py-10 md:w-1/2 md:px-12 lg:px-20">
          {data?.title && (
            <h2 className="font-serif text-2xl leading-snug text-[#1F2937] md:text-3xl lg:text-4xl">
              {data.title}
            </h2>
          )}

          {descriptionHtml && (
            <div
              className={descriptionClassName}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}

          {data?.buttonText && (
            <Link
              href={data?.buttonURL || ""}
              className="mt-6 inline-flex w-fit border border-black px-8 py-3 text-sm font-medium tracking-wide text-black transition-all duration-300 hover:bg-black hover:text-white"
            >
              {data.buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
