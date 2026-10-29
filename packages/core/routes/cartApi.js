import { errorResponse, saveCartToken } from "@df/core/routes/cartHelpers";
import { addConfiguredItemToBag } from "@df/core/services/cart";
import { getPDP } from "@df/core/services/commerce";
import { buildAddToCartInput } from "@df/core/utils/cartInput";

// Server-side proxy for "Add to Bag": the browser posts the full AddToCartInput
// (see utils/cartInput.js); it's added to the Vendure cart, whose session token
// stays in an httpOnly cookie. Vendure charges the price exactly as sent, so the
// pricing is re-checked against the PDP API before it is forwarded.
export async function POST(request) {
  const input = await request.json().catch(() => null);
  const { sku, slug, language = "de" } = input ?? {};
  const quantity = Number(input?.quantity);

  if (!sku || !slug || !input.product?.name || !(input.pricing?.price > 0)) {
    return Response.json(
      { error: "sku, slug, product.name and pricing.price are required" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return Response.json({ error: "quantity must be 1 or more" }, { status: 400 });
  }

  try {
    const pdp = await getPDP(slug, sku, language);
    if (!pdp?.data?.basicDetails) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // The price for this exact SKU according to the PDP API.
    const { pricing } = buildAddToCartInput(pdp.data, { sku, slug, quantity, language });
    if (Math.abs(pricing.price - input.pricing.price) > 0.005) {
      return Response.json(
        { error: "The price has changed, please refresh the page", pricing },
        { status: 409 },
      );
    }

    const { cart, token } = await addConfiguredItemToBag({ ...input, quantity, pricing });
    await saveCartToken(token);
    return Response.json({ cart });
  } catch (error) {
    return errorResponse("Add to bag", error, "Could not add to bag");
  }
}
