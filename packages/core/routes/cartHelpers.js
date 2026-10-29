import { cookies } from "next/headers";
import { VENDURE_TOKEN_COOKIE } from "@df/core/services/cart";

// Shared by the /api/cart/* route handlers.

// Keeps Vendure's session token (the cart) in an httpOnly cookie, never in client JS.
export async function saveCartToken(token) {
  if (!token) return;
  const cookieStore = await cookies();
  cookieStore.set(VENDURE_TOKEN_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

// Vendure's validation messages (invalid SKU, unknown coupon, …) are shown to
// the shopper; anything else becomes a generic message.
export function errorResponse(label, error, fallback) {
  console.error(`${label}:`, error.message);
  if (error.userMessage) return Response.json({ error: error.userMessage }, { status: 400 });
  return Response.json({ error: fallback }, { status: 502 });
}
