import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";

import Breadcrumb from "@/components/common/Breadcrumb";
import { richTextToHtml } from "@/utils/richText";

// Content type "static_page" (About Us, T&C, customer care pages, ...), same
// layout as the Strapi StaticPageContent: breadcrumb, rich-text `content`,
// then the `component_content` sections.
//
// The breadcrumb is Home › parent page (the `parent_page` reference, resolved
// in the page route) › this page. Turn it off with `show_breadcrumb`.
export default function StaticPage({ blok }) {
  const html = richTextToHtml(blok.content);
  const parent = typeof blok.parent_page === "object" ? blok.parent_page : null;

  const breadcrumbItems =
    blok.show_breadcrumb === false
      ? null
      : [
          { label: "Home", url: "/" },
          parent && {
            label: parent.content?.title || parent.name,
            url: `/${parent.full_slug}`,
          },
          { label: blok.title },
        ].filter(Boolean);

  return (
    <main {...storyblokEditable(blok)}>
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}

      <section className="mx-auto max-w-full">
        {html && (
          <div
            className="mx-auto max-w-7xl px-4 lg:px-10 [&_h1]:text-[32px] [&_h2]:text-[26px] [&_h3]:text-2xl [&_h4]:text-xl [&_h5]:text-lg [&_h6]:text-base lg:[&_h1]:text-[40px] lg:[&_h2]:text-[32px] [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:my-4 [&_h2]:my-4 [&_h3]:my-3 [&_h4]:my-3 [&_h5]:my-2 [&_h6]:my-2 [&_h1]:leading-tight [&_h2]:leading-tight [&_h3]:leading-tight [&_p]:text-base [&_p]:leading-7 [&_p]:text-[#4B4B4B] [&_p]:my-3 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-5 [&_li]:my-1 [&_li>p]:m-0 [&_blockquote]:italic [&_a]:text-[#A0704F] [&_a]:underline [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {blok.component_content?.map((section) => (
          <StoryblokServerComponent blok={section} key={section._uid} />
        ))}
      </section>
    </main>
  );
}
