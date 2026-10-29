import Link from "next/link";

import { getOrderByCode } from "@df/core/services/cart";
import { formatPrice } from "@df/core/utils/formatPrice";

export const metadata = { title: "Order confirmation", robots: { index: false } };

// Readable Vendure order states.
const STATES = {
  AddingItems: "Not placed yet",
  ArrangingPayment: "Awaiting payment",
  PaymentAuthorized: "Placed (payment authorised)",
  PaymentSettled: "Placed (paid)",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

// Order confirmation, e.g. /order/2HZB5F8JFNLE2SWH: the order read back from
// Vendure (same code as in the Vendure Dashboard). Vendure's default
// orderByCode access: the customer's own orders, and guest orders for a short
// time after they're placed (2 hours); otherwise it returns nothing.
export default async function OrderPage({ params }) {
  const { code } = await params;
  const order = await getOrderByCode(code).catch((error) => {
    console.error("Order page:", error.message);
    return null;
  });

  if (!order) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Order not found</h1>
        <p className="mb-6 text-sm text-gray-600">
          Order <span className="font-mono">{code}</span> doesn&apos;t exist or can no longer be
          viewed here.
        </p>
        <Link href="/" className="text-brand-pdp underline">
          Continue shopping
        </Link>
      </section>
    );
  }

  const currency = order.currency;
  const address = order.address;
  const discountTotal = order.discounts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-brand-pdp">Thank you for your order!</h1>
      <p className="mt-2 text-sm">
        Order <span className="font-mono font-semibold">{order.code}</span>
        {order.email && (
          <>
            {" "}
            · confirmation goes to <strong>{order.email}</strong>
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Status: {STATES[order.state] ?? order.state}
        {order.placedAt && ` · ${new Date(order.placedAt).toLocaleString("en-GB")}`}
      </p>

      <ul className="mt-8 divide-y divide-[#E8DDCF] border-y border-[#E8DDCF]">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4">
            {item.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnail} alt={item.title} className="h-20 w-20 shrink-0 object-cover" />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold">{item.title}</p>
              {item.sku && <p className="break-all text-xs text-gray-500">{item.sku}</p>}
              {item.options && <p className="mt-1 text-xs text-gray-600">{item.options}</p>}
              <p className="mt-1 text-xs">Qty: {item.quantity}</p>
            </div>
            <div className="whitespace-nowrap text-right text-sm">
              {item.discountedLinePrice < item.linePrice && (
                <p className="text-xs text-gray-400 line-through">
                  {formatPrice(item.linePrice, currency)}
                </p>
              )}
              <p className="font-semibold">{formatPrice(item.discountedLinePrice, currency)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="space-y-1 text-sm">
          <h2 className="mb-2 font-semibold">Delivery</h2>
          {address ? (
            <address className="not-italic text-gray-700">
              {address.fullName}
              <br />
              {address.streetLine1}
              {address.streetLine2 && (
                <>
                  <br />
                  {address.streetLine2}
                </>
              )}
              <br />
              {address.city} {address.postalCode}
              <br />
              {address.country}
              {address.phoneNumber && (
                <>
                  <br />
                  {address.phoneNumber}
                </>
              )}
            </address>
          ) : (
            <p className="text-gray-500">No address</p>
          )}
          {order.shippingMethod && <p className="pt-2 text-gray-700">{order.shippingMethod.name}</p>}
        </div>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(order.subtotal - discountTotal, currency)}</dd>
          </div>
          {order.discounts.map((discount) => (
            <div key={discount.description} className="flex justify-between text-brand-pdp">
              <dt>{discount.description}</dt>
              <dd>−{formatPrice(Math.abs(discount.amount), currency)}</dd>
            </div>
          ))}
          {order.couponCodes.length > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <dt>Coupon</dt>
              <dd>{order.couponCodes.join(", ")}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{formatPrice(order.shipping, currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-[#E8DDCF] pt-2 font-semibold">
            <dt>Total (incl. VAT)</dt>
            <dd>{formatPrice(order.total, currency)}</dd>
          </div>
        </dl>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm text-brand-pdp underline">
        Continue shopping
      </Link>
    </section>
  );
}
