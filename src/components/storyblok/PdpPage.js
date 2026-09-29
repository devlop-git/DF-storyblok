import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";

import PdpProduct from "@/components/pdp/PdpProduct";

// Content type "pdp_page": the CMS sections shown under every product (same as
// the Strapi PdpCmsSections). `pdp` is the Commerce PDP API data for the
// current /design/{slug}/{sku}; it's missing when the story is previewed at
// its own URL, so a placeholder stands in for the product.
export default function PdpPage({ blok, pdp }) {
  return (
    <main {...storyblokEditable(blok)}>
      {pdp ? (
        <PdpProduct pdp={pdp} />
      ) : (
        <div className="mx-auto my-8 max-w-7xl border border-dashed border-[#d7b89c] p-10 text-center text-sm text-[#8b6b49]">
          Product: gallery and configurator from the Commerce API appear here on
          product pages (/design/&#123;slug&#125;/&#123;sku&#125;).
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-8 lg:px-10">
        {blok.pdp_section?.map((section) => (
          <StoryblokServerComponent blok={section} key={section._uid} />
        ))}
      </section>
    </main>
  );
}
