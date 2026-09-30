import Link from "next/link";
import { richTextToHtml } from "@/utils/richText";
import { asset } from "@/utils/storyblok";

function IconRow({ items }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8 lg:justify-start">
      {items.map((item, index) => {
        const icon = asset(item?.icon);

        return (
          <div key={item?._uid ?? index} className="flex flex-col items-center gap-3">
            {icon && (
              <img
                src={icon.filename}
                alt={icon.alt || item?.label || ""}
                className="h-20 w-20 object-contain"
              />
            )}

            {item?.label && (
              <span className="text-sm text-[#8A6D4E]">{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ImageTextSection({ data }) {
  const desktopImage = asset(data?.desktopImage);
  const tabletImage = asset(data?.tabImage);
  const mobileImage = asset(data?.mobileImage);
  const titleHtml = richTextToHtml(data?.title);
  const html = richTextToHtml(data?.description);
  const iconItems = data?.iconItems || [];
  const hasIconRow = iconItems.length > 0;
  const hasImage = !hasIconRow && Boolean(desktopImage || tabletImage || mobileImage);
  const hasSideContent = hasImage || hasIconRow;

  return (
    <section className="w-full bg-[#FAF7F2] border-y border-gray-100 py-14 lg:py-18">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {(data?.topTitle || data?.topDescription) && (
          <div className="max-w-3xl mx-auto text-center mb-12">
            {data?.topTitle && (
              <h2 className="font-serif text-[28px] lg:text-[36px] font-light text-[#171717] leading-tight">
                {data.topTitle}
              </h2>
            )}

            {data?.topDescription && (
              <p className="mt-4 text-base leading-7 text-[#4B4B4B]">
                {data.topDescription}
              </p>
            )}
          </div>
        )}

        <div
          className={
            hasSideContent
              ? `grid lg:grid-cols-2 gap-20 items-center ${
                  data.imagePosition === "left" ? "" : "lg:flex-row-reverse"
                }`
              : "flex justify-center"
          }
        >
          {/* Content */}
          <div
            className={
              hasSideContent
                ? `max-w-lg ${
                    data.imagePosition === "right" ? "lg:order-1" : "lg:order-2"
                  }`
                : "max-w-3xl w-full"
            }
          >
            {titleHtml && (
              <div
                className="font-serif text-[#171717] text-5xl lg:text-7xl leading-[1.05] font-light [&_em]:text-brand-accent"
                dangerouslySetInnerHTML={{ __html: titleHtml }}
              />
            )}

            {html && (
              <div
                className="mt-8 [&_h1]:text-2xl [&_h2]:text-2xl [&_h3]:text-2xl [&_h4]:text-xl [&_h5]:text-lg [&_h6]:text-base [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h4]:my-2 [&_h5]:my-2 [&_h6]:my-2 [&_h1]:leading-tight [&_h2]:leading-tight [&_h3]:leading-tight [&_h1]:text-[#171717] [&_h2]:text-[#171717] [&_h3]:text-[#171717] [&_p]:text-[17px] [&_p]:leading-8 [&_p]:text-gray-700 [&_p]:my-2 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_li]:my-1 [&_li>p]:m-0 [&_blockquote]:italic [&_a]:text-brand-accent [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}

            {data?.buttonText && (
              <Link
                href={data?.buttonURL || ""}
                target="_blank"
                className="inline-flex mt-10 border border-black px-10 py-4 text-sm font-medium tracking-wide hover:bg-black hover:text-white text-black transition-all duration-300"
              >
                {data?.buttonText}
              </Link>
            )}
          </div>

          {/* Image or icon row */}
          {hasSideContent && (
            <div
              className={`flex justify-center ${
                data.imagePosition === "right" ? "lg:order-2" : "lg:order-1"
              }`}
            >
              {hasIconRow ? (
                <IconRow items={iconItems} />
              ) : (
                <picture>
                  {desktopImage && (
                    <source media="(min-width:1024px)" srcSet={desktopImage.filename} />
                  )}

                  {tabletImage && (
                    <source media="(min-width:768px)" srcSet={tabletImage.filename} />
                  )}

                  <img
                    src={(mobileImage || tabletImage || desktopImage).filename}
                    alt={data.topTitle || ""}
                    className="w-full max-w-[650px] object-cover"
                  />
                </picture>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
