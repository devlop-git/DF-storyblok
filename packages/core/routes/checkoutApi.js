import { errorResponse } from "@df/core/routes/cartHelpers";
import { checkoutCart } from "@df/core/services/cart";

const REQUIRED_ADDRESS_FIELDS = [
  "first_name",
  "last_name",
  "address_1",
  "city",
  "postal_code",
  "country_code",
];

// Server-side proxy for the checkout page: the browser posts { email,
// shipping_address } and the cart is the Vendure session in the httpOnly
// cookie. Places the order (customer, addresses, shipping, payment) and
// returns it; Vendure then starts a new, empty cart for the same session.
export async function POST(request) {
  const { email, shipping_address } = (await request.json().catch(() => null)) ?? {};

  const missing = [
    !email?.trim() && "email",
    ...REQUIRED_ADDRESS_FIELDS.filter((field) => !shipping_address?.[field]?.trim()),
  ].filter(Boolean);
  if (missing.length) {
    return Response.json({ error: `Please fill in: ${missing.join(", ")}` }, { status: 400 });
  }

  try {
    const order = await checkoutCart({ email, address: shipping_address });
    return Response.json({ order });
  } catch (error) {
    return errorResponse("Checkout", error, "Could not place the order");
  }
}
