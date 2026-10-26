import Link from "next/link";

import { getCart } from "@df/core/services/cart";
import { formatPrice } from "@df/core/utils/formatPrice";
import CheckoutForm from "@df/ui/checkout/CheckoutForm";

export const metadata = { title: "Checkout" };

// Checkout: the bag (Medusa cart from the cart id cookie) next to a simple
// email + delivery address form that places the order.
export default async function CheckoutPage() {
  const cart = await getCart();
  const currency = cart?.currency_code?.toUpperCase();

  if (!cart?.items?.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-10">
        <h1 className="mb-4 text-2xl font-semibold">Your bag is empty</h1>
        <Link href="/" className="text-brand-pdp underline">
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-10">
      <h1 className="mb-8 text-2xl font-semibold">Checkout</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <CheckoutForm />

        {/* Order summary */}
        <div className="h-fit space-y-4 bg-[#FAF7F2] p-4">
          <h2 className="text-lg font-semibold">Your bag</h2>

          <ul className="divide-y divide-[#E8DDCF]">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                {item.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-20 w-20 shrink-0 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{item.title}</p>
                  {item.variant_sku && (
                    <p className="break-all text-xs text-gray-500">{item.variant_sku}</p>
                  )}
                  {item.subtitle && <p className="mt-1 text-xs text-gray-600">{item.subtitle}</p>}
                  <p className="mt-1 text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="whitespace-nowrap text-sm font-semibold">
                  {formatPrice(item.unit_price * item.quantity, currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-[#E8DDCF] pt-4 font-semibold">
            <span>Total (incl. VAT)</span>
            <span>{formatPrice(cart.total, currency)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
