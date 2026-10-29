"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";

import { formatPrice } from "@df/core/utils/formatPrice";

// The bag on the checkout page: lines (quantity / remove), coupon codes,
// shipping method and the totals from the Vendure order. Every change returns
// the updated cart, which replaces the one rendered by the server; the header
// bag icon is told via the "cart:updated" event.
export default function CartSummary({ cart: initialCart, shippingMethods = [] }) {
  const [cart, setCart] = useState(initialCart);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const currency = cart.currency;

  const call = async (url, method, body) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setCart(data.cart);
      window.dispatchEvent(new Event("cart:updated"));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const applyCoupon = async (event) => {
    event.preventDefault();
    if (await call("/api/cart/coupon", "POST", { code })) setCode("");
  };

  if (!cart?.items?.length) {
    return (
      <div className="h-fit bg-[#FAF7F2] p-4 text-sm">
        Your bag is empty. Refresh the page to start again.
      </div>
    );
  }

  return (
    <div className="h-fit space-y-4 bg-[#FAF7F2] p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Your bag</h2>
        {/* Same code as the order in the Vendure Dashboard */}
        <span className="text-xs text-gray-500">
          Order <span className="font-mono font-semibold text-gray-800">{cart.code}</span>
        </span>
      </div>

      <ul className="divide-y divide-[#E8DDCF]">
        {cart.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4">
            {item.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnail} alt={item.title} className="h-20 w-20 shrink-0 object-cover" />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold">{item.title}</p>
              {item.sku && <p className="break-all text-xs text-gray-500">{item.sku}</p>}
              {item.options && <p className="mt-1 text-xs text-gray-600">{item.options}</p>}
              <div className="mt-2 flex items-center gap-3 text-xs">
                <div className="flex items-center border border-[#E8DDCF] bg-white">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      call("/api/cart/line", "PATCH", { lineId: item.id, quantity: item.quantity - 1 })
                    }
                    aria-label="Decrease quantity"
                    className="px-2 py-1 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      call("/api/cart/line", "PATCH", { lineId: item.id, quantity: item.quantity + 1 })
                    }
                    aria-label="Increase quantity"
                    className="px-2 py-1 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => call("/api/cart/line", "DELETE", { lineId: item.id })}
                  className="text-brand-pdp underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
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

      {/* Shipping method (Vendure's eligible methods) */}
      {shippingMethods.length > 0 && (
        <fieldset className="space-y-2 border-t border-[#E8DDCF] pt-4 text-sm">
          <legend className="mb-2 font-semibold">Delivery</legend>
          {shippingMethods.map((method) => (
            <label key={method.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="shipping"
                disabled={busy}
                checked={cart.shippingMethod?.id === method.id}
                onChange={() => call("/api/cart/shipping", "POST", { id: method.id })}
              />
              <span className="flex-1">{method.name}</span>
              <span>{formatPrice(method.price, currency)}</span>
            </label>
          ))}
          {!cart.shippingMethod && (
            <p className="text-xs text-gray-500">
              If you don&apos;t pick one, {shippingMethods[0].name} is used.
            </p>
          )}
        </fieldset>
      )}

      {/* Coupon codes (Vendure promotions) */}
      <form onSubmit={applyCoupon} className="flex gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="min-w-0 flex-1 border border-[#E8DDCF] bg-white px-3 py-2 text-sm uppercase focus:border-brand-pdp focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="bg-brand-pdp px-4 text-xs font-semibold uppercase text-white disabled:opacity-60"
        >
          Apply
        </button>
      </form>
      {cart.couponCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cart.couponCodes.map((couponCode) => (
            <button
              key={couponCode}
              type="button"
              disabled={busy}
              onClick={() => call("/api/cart/coupon", "DELETE", { code: couponCode })}
              className="flex items-center gap-1 bg-[#f1e3d2] px-2 py-1 text-xs"
              aria-label={`Remove coupon ${couponCode}`}
            >
              {couponCode}
              <IoClose size={14} />
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-[#e72618]">{error}</p>}

      <dl className="space-y-1 border-t border-[#E8DDCF] pt-4 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.subtotal + cart.discounts.reduce((sum, d) => sum - d.amount, 0), currency)}</dd>
        </div>
        {cart.discounts.map((discount) => (
          <div key={discount.description} className="flex justify-between text-brand-pdp">
            <dt>{discount.description}</dt>
            <dd>−{formatPrice(Math.abs(discount.amount), currency)}</dd>
          </div>
        ))}
        {cart.shipping > 0 && (
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{formatPrice(cart.shipping, currency)}</dd>
          </div>
        )}
        <div className="flex justify-between pt-2 font-semibold">
          <dt>Total (incl. VAT)</dt>
          <dd>{formatPrice(cart.total, currency)}</dd>
        </div>
      </dl>
    </div>
  );
}
