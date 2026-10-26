// Builds the AddToCartInput (Medusa POST /store/add-to-cart) for one configured
// design from PDP API data ({ basicDetails, priceInformation, imagesInformation,
// options }). Pure, so the PDP (browser) and /api/cart/add (server) build the
// payload the same way.
//
// `selections` ({ "Metal": "12", ... }) is the shopper's current choice per
// option; without it, each option's `isSelected` value is used.
export function buildAddToCartInput(pdp, { sku, slug, quantity = 1, language, selections }) {
  const { basicDetails = {}, priceInformation = {}, imagesInformation, options = [] } = pdp;
  const { promotion, tax } = priceInformation;

  const selectedOptions = options
    .map((option) => {
      const valueCode =
        selections?.[option.name] ?? option.values?.find((v) => v.isSelected)?.valueCode;
      const value = option.values?.find((v) => v.valueCode === valueCode);
      return (
        value && {
          featureId: option.featureId,
          name: option.name,
          valueCode: value.valueCode,
          value: value.displayName || value.valueName,
        }
      );
    })
    .filter(Boolean);

  const firstGroup = imagesInformation?.galleryGroups?.[0];

  return {
    sku,
    slug,
    quantity,
    language,
    product: {
      name:
        basicDetails.name ||
        `${basicDetails.subCategory ?? ""} ${basicDetails.category ?? ""}`.trim(),
      description: basicDetails.description,
      imageUrl: firstGroup?.thumbnail?.path ?? firstGroup?.items?.[0]?.path,
      designRef: basicDetails.designRef,
      category: basicDetails.category,
      subCategory: basicDetails.subCategory,
      ornamentType: basicDetails.ornamentType,
    },
    pricing: {
      // Price after promotion incl. VAT (e.g. 803.25); totalPrice is rounded.
      price: priceInformation.subTotalAfterPromotion ?? priceInformation.totalPrice,
      listPrice: priceInformation.listPrice,
      currency: priceInformation.currency,
      discountAmount: promotion?.amount,
      promotionCode: promotion?.code,
      promotionDescription: promotion?.description,
      // The PDP API sends VAT as a multiplier (1.19); the cart expects 0.19.
      taxRate: tax?.rate > 1 ? Math.round((tax.rate - 1) * 10000) / 10000 : tax?.rate,
      taxAmount: tax?.amount,
    },
    selectedOptions,
    metadata: {
      designNumber: basicDetails.designNumber,
      productCode: basicDetails.productCode,
      ornamentId: basicDetails.ornamentId,
    },
  };
}
