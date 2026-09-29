import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";

import Breadcrumb from "@/components/common/Breadcrumb";

// Content type "plp_page": the layout of every product listing page (same as
// the Strapi PlpLayout). `commerce` is the PLP API response for the current
// /{category}/{subCategory}; it's passed to every section so the
// product_listing block can render the products.
export default function PlpPage({ blok, commerce }) {
  return (
    <main
      {...storyblokEditable(blok)}
      className="max-w-10xl mx-auto flex flex-col gap-y-6 text-black"
    >
      <Breadcrumb items={commerce?.breadcrumb} />
      {blok.plp_section?.map((section) => (
        <StoryblokServerComponent blok={section} key={section._uid} commerce={commerce} />
      ))}
    </main>
  );
}
