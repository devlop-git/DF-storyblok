import { errorResponse } from "@df/core/routes/cartHelpers";
import { adjustLine, removeLine } from "@df/core/services/cart";

// PATCH { lineId, quantity }: changes a line's quantity (0 removes it).
export async function PATCH(request) {
  const { lineId, quantity } = (await request.json().catch(() => null)) ?? {};
  const qty = Number(quantity);
  if (!lineId || !Number.isInteger(qty) || qty < 0) {
    return Response.json({ error: "Missing lineId or quantity" }, { status: 400 });
  }
  try {
    return Response.json({ cart: qty === 0 ? await removeLine(lineId) : await adjustLine(lineId, qty) });
  } catch (error) {
    return errorResponse("Change quantity", error, "Could not change the quantity");
  }
}

// DELETE { lineId }: removes a line from the Vendure cart. Returns { cart }.
export async function DELETE(request) {
  const { lineId } = (await request.json().catch(() => null)) ?? {};
  if (!lineId) return Response.json({ error: "Missing lineId" }, { status: 400 });
  try {
    return Response.json({ cart: await removeLine(lineId) });
  } catch (error) {
    return errorResponse("Remove line", error, "Could not remove the item");
  }
}
