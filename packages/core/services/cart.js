import { cookies } from "next/headers";

// Medusa v2 store API. POST /store/add-to-cart is a custom route that adds a
// configured design to a cart as a custom line item (see utils/cartInput.js
// for the payload). The cart is identified by cart_id: omitted on the first
// call, then the returned cart.id is sent on every later call.
const MEDUSA_STORE_URL = process.env.MEDUSA_STORE_URL || "http://localhost:9000";
const MEDUSA_PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY;

// httpOnly cookie that holds the Medusa cart id (set by routes/cartApi.js).
export const CART_ID_COOKIE = "medusa-cart-id";

// Every Medusa store call needs the publishable key (it picks the sales channel).
function medusaFetch(path, { body, ...options } = {}) {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error("MEDUSA_PUBLISHABLE_KEY is not set in .env.local");
  }

  return fetch(`${MEDUSA_STORE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    },
    ...(body && { method: "POST", body: JSON.stringify(body) }),
    cache: "no-store",
  });
}

// Reads a Medusa response; on failure throws with Medusa's message, attached
// as `userMessage` for 4xx errors (e.g. invalid data) so it can be shown.
async function readMedusaResponse(response, label) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Medusa ${label} error ${response.status}: ${data.message}`);
    if (response.status < 500 && data.message) error.userMessage = data.message;
    throw error;
  }
  return data;
}

const postAddToCart = (body) => medusaFetch("/store/add-to-cart", { body });

// Adds a configured design (AddToCartInput, see utils/cartInput.js) to the
// shopper's cart, creating the cart on first use. Returns the Medusa cart.
export async function addConfiguredItemToBag(input) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  let response = await postAddToCart({ ...input, cart_id: cartId });

  // The saved cart no longer exists (deleted, or a different Medusa DB):
  // start a new one instead of failing.
  if (response.status === 404 && cartId) {
    response = await postAddToCart(input);
  }

  const data = await readMedusaResponse(response, "add-to-cart");
  return data.cart;
}

const CART_FIELDS = "id,currency_code,total,subtotal,tax_total,completed_at,*items";

// The shopper's current cart (from the cart id cookie), or null when there is
// none, it no longer exists, or it has already been checked out.
export async function getCart() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
  if (!cartId) return null;

  const response = await medusaFetch(`/store/carts/${cartId}?fields=${CART_FIELDS}`);
  if (response.status === 404) return null;

  const { cart } = await readMedusaResponse(response, "cart");
  return cart?.completed_at ? null : cart;
}

// One-call checkout of the shopper's cart: sets email and addresses, pays with
// Medusa's test payment provider and completes the cart. Returns the order.
// billing_address defaults to shipping_address on the Medusa side.
export async function checkoutCart({ email, shipping_address, billing_address }) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
  if (!cartId) {
    const error = new Error("No cart to check out");
    error.userMessage = "Your bag is empty";
    throw error;
  }

  const response = await medusaFetch("/store/checkout", {
    body: { cart_id: cartId, email, shipping_address, billing_address },
  });
  const { order } = await readMedusaResponse(response, "checkout");
  return order;
}
