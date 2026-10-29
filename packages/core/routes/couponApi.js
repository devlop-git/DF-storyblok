import { errorResponse } from "@df/core/routes/cartHelpers";
import { applyCoupon, removeCoupon } from "@df/core/services/cart";

// Coupon codes on the Vendure cart: POST { code } applies, DELETE { code } removes.
// Returns { cart }; Vendure's message (e.g. unknown or expired code) is shown as is.
async function readCode(request) {
  const { code } = (await request.json().catch(() => null)) ?? {};
  return code?.trim();
}

export async function POST(request) {
  const code = await readCode(request);
  if (!code) return Response.json({ error: "Please enter a coupon code" }, { status: 400 });
  try {
    return Response.json({ cart: await applyCoupon(code) });
  } catch (error) {
    return errorResponse("Apply coupon", error, "Could not apply the coupon");
  }
}

export async function DELETE(request) {
  const code = await readCode(request);
  if (!code) return Response.json({ error: "Missing coupon code" }, { status: 400 });
  try {
    return Response.json({ cart: await removeCoupon(code) });
  } catch (error) {
    return errorResponse("Remove coupon", error, "Could not remove the coupon");
  }
}
