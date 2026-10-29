import Link from "next/link";

import { getCart, getShippingMethods } from "@df/core/services/cart";
import CartSummary from "@df/ui/checkout/CartSummary";
import CheckoutForm from "@df/ui/checkout/CheckoutForm";

export const metadata = { title: "Checkout" };

// Checkout: the bag (the Vendure cart of this session: quantities, coupon
// codes, delivery method) next to a simple email + delivery address form that
// places the order and opens its confirmation page.
export default async function CheckoutPage() {
  const cart = await getCart().catch((error) => {
    console.error("Checkout cart:", error.message);
    return null;
  });

  const shippingMethods = cart?.items?.length ? await getShippingMethods().catch(() => []) : [];

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
        <CartSummary cart={cart} shippingMethods={shippingMethods} />
      </div>
    </section>
  );
}
