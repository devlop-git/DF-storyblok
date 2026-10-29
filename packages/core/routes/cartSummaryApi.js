import { getCart } from "@df/core/services/cart";

// GET: how many items are in the session's Vendure cart (header bag icon).
export async function GET() {
  try {
    const cart = await getCart();
    return Response.json({ count: cart?.totalQuantity ?? 0, code: cart?.code ?? null });
  } catch (error) {
    console.error("Cart count:", error.message);
    return Response.json({ count: 0, code: null });
  }
}
