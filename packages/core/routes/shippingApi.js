import { errorResponse } from "@df/core/routes/cartHelpers";
import { getShippingMethods, setShippingMethod } from "@df/core/services/cart";

// GET: shipping methods for the cart ({ methods: [{ id, name, price }] }).
export async function GET() {
  try {
    return Response.json({ methods: await getShippingMethods() });
  } catch (error) {
    return errorResponse("Shipping methods", error, "Could not load shipping methods");
  }
}

// POST { id }: picks the cart's shipping method. Returns { cart }.
export async function POST(request) {
  const { id } = (await request.json().catch(() => null)) ?? {};
  if (!id) return Response.json({ error: "Missing shipping method" }, { status: 400 });
  try {
    return Response.json({ cart: await setShippingMethod(String(id)) });
  } catch (error) {
    return errorResponse("Set shipping", error, "Could not change the shipping method");
  }
}
