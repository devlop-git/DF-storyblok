import { cookies } from "next/headers";
import { CART_ID_COOKIE, checkoutCart } from "@df/core/services/cart";

const REQUIRED_ADDRESS_FIELDS = [
  "first_name",
  "last_name",
  "address_1",
  "city",
  "postal_code",
  "country_code",
];

// Server-side proxy for the checkout page: the browser posts { email,
// shipping_address, billing_address? } and the cart id comes from the httpOnly
// cookie. On success the cookie is cleared, so the next Add to Bag starts a
// new cart.
export async function POST(request) {
  const { email, shipping_address, billing_address } =
    (await request.json().catch(() => null)) ?? {};

  const missing = [
    !email?.trim() && "email",
    ...REQUIRED_ADDRESS_FIELDS.filter((field) => !shipping_address?.[field]?.trim()),
  ].filter(Boolean);
  if (missing.length) {
    return Response.json({ error: `Please fill in: ${missing.join(", ")}` }, { status: 400 });
  }

  try {
    const order = await checkoutCart({ email, shipping_address, billing_address });

    const cookieStore = await cookies();
    cookieStore.delete(CART_ID_COOKIE);

    return Response.json({ order });
  } catch (error) {
    console.error("Checkout:", error.message);
    if (error.userMessage) {
      return Response.json({ error: error.userMessage }, { status: 400 });
    }
    return Response.json({ error: "Could not place the order" }, { status: 502 });
  }
}
