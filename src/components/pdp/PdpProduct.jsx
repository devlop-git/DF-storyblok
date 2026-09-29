import Breadcrumb from "@/components/common/Breadcrumb";
import PdpDetails from "./PdpDetails";
import PdpGallery from "./PdpGallery";
import { slugify } from "@/utils/slugify";

// Breadcrumb + gallery + configurator/details for one design, from the
// Commerce PDP API response (`pdp` = { data, meta, slug, sku, locale }).
export default function PdpProduct({ pdp }) {
  const { data, meta, slug, sku, locale } = pdp;
  const {
    basicDetails,
    options,
    priceInformation,
    imagesInformation,
    bomDetails,
    inStockProducts,
  } = data;

  // The category crumb has no page of its own (only subcategories are real
  // PLP routes), so it's left without a `url` and renders as plain text.
  const categorySlug = basicDetails?.category && slugify(basicDetails.category);
  const subCategorySlug =
    basicDetails?.subCategory && slugify(basicDetails.subCategory);

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    basicDetails?.category && { label: basicDetails.category },
    basicDetails?.subCategory &&
      categorySlug && {
        label: basicDetails.subCategory,
        url: `/${categorySlug}/${subCategorySlug}`,
      },
    {
      label:
        basicDetails?.name ||
        `${basicDetails?.subCategory ?? ""} ${basicDetails?.category ?? ""}`.trim(),
    },
  ].filter(Boolean);

  const caption = bomDetails?.totalStoneWeightCt
    ? `Image displayed to approx. ${bomDetails.totalStoneWeightCt.toFixed(2)}ct diamond.`
    : null;

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <PdpGallery
            galleryGroups={imagesInformation?.galleryGroups}
            caption={caption}
          />
          <PdpDetails
            // Fresh state for each sku/language the server renders.
            key={`${sku}-${locale}`}
            basicDetails={basicDetails}
            priceInformation={priceInformation}
            options={options}
            meta={{ ...meta, slug, locale }}
            bomDetails={bomDetails}
            inStockProducts={inStockProducts}
          />
        </div>
      </section>
    </>
  );
}
