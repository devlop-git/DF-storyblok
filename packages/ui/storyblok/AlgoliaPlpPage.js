import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";

import Breadcrumb from "@df/ui/common/Breadcrumb";
import AlgoliaProductListing from "@df/ui/plp/algolia/AlgoliaProductListing";

// Content type "plp_page" in apps whose products come from Algolia.
//   - Menu URLs (/engagement-rings/solitaire, AlgoliaCategoryRoute): the
//     category/sub-category come from the URL as props; the story is only the layout.
//   - A plp_page story opened at its own slug: the story's `algoliaCategory`
//     (empty = all products).
// The scope is passed to every section, so the algolia_product_listing block
// searches in it. Without that block in the story, the products are shown
// after the sections anyway.
export default function AlgoliaPlpPage({ blok, algoliaCategory, algoliaSubCategory, facetValues }) {
  const category = algoliaCategory ?? blok.algoliaCategory;
  const subCategory = algoliaSubCategory ?? null;
  console.log('cat---',category, subCategory);
  const scope = { algoliaCategory: category, algoliaSubCategory: subCategory, facetValues };
  const hasListing = blok.plp_section?.some((s) => s.component === "algolia_product_listing");

  const breadcrumb = [
    { label: "Home", url: "/" },
    ...(category ? [{ label: category }] : [{ label: blok.title || "All jewellery" }]),
    ...(subCategory ? [{ label: subCategory }] : []),
  ];

  return (
    <main
      {...storyblokEditable(blok)}
      className="max-w-10xl mx-auto flex flex-col gap-y-6 text-black"
    >
      <Breadcrumb items={breadcrumb} />
      {blok.plp_section?.map((section) => (
        <StoryblokServerComponent blok={section} key={section._uid} {...scope} />
      ))}
      {!hasListing && <AlgoliaProductListing {...scope} />}
    </main>
  );
}
