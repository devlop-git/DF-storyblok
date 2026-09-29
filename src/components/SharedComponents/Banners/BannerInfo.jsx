import { richTextToHtml } from "@/utils/richText";

export default function BannerInfo({ data }) {
  const html = richTextToHtml(data?.description);

  return (
    <section
      className="lg:bg-[var(--banner-bg-color)] transition-all duration-500 lg:min-h-[314px]"
      style={{ "--banner-bg-color": data?.bgColor }}
    >
      <div className="mx-auto flex max-w-7xl flex-col justify-center px-5 md:px-8 lg:px-12 transition-all duration-500 lg:min-h-[314px]">
        {/* Heading */}
        <h2 className="text-center font-serif text-[38px] leading-tight text-[#1D1D1D] md:text-[48px] lg:leading-15">
          {data?.title}
        </h2>

        {/* Description */}
        {html && (
          <div
            className="mx-auto mt-8 max-w-5xl text-center [&_h1]:text-2xl [&_h2]:text-2xl [&_h3]:text-2xl [&_h4]:text-xl [&_h5]:text-lg [&_h6]:text-base [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h1]:leading-tight [&_h2]:leading-tight [&_h3]:leading-tight [&_p]:text-[16px] [&_p]:lg:leading-8 [&_p]:text-[#262626] [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_li]:my-1 [&_li>p]:m-0 [&_blockquote]:italic [&_a]:text-[#A0704F] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  );
}
