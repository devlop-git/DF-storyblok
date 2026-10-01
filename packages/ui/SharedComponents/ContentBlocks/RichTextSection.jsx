import { richTextToHtml } from "@df/core/utils/richText";

export default function RichTextSection({ data }) {
  const html = richTextToHtml(data?.content);

  return (
    <section
      className="w-full"
      style={data?.bgColor ? { backgroundColor: data.bgColor } : undefined}
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        {data?.heading && (
          <h2 className="font-serif text-2xl uppercase tracking-wide text-[#1F2937]">
            {data.heading}
          </h2>
        )}

        {html && (
          <div
            className="mt-4 [&_h1]:text-[32px] [&_h2]:text-[26px] [&_h3]:text-2xl [&_h4]:text-xl [&_h5]:text-lg [&_h6]:text-base lg:[&_h1]:text-[40px] lg:[&_h2]:text-[32px] [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h4]:my-2 [&_h5]:my-2 [&_h6]:my-2 [&_h1]:leading-tight [&_h2]:leading-tight [&_h3]:leading-tight [&_p]:text-base [&_p]:leading-7 [&_p]:text-[#4B4B4B] [&_p]:my-2 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_li]:my-1 [&_li>p]:m-0 [&_blockquote]:italic [&_a]:text-brand-accent [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  );
}
