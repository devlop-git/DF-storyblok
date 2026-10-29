"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { formatPrice } from "@df/core/utils/formatPrice";

// Delivery fields; the country is fixed to the UK (the Vendure channel's currency is GBP).
const FIELDS = [
  { name: "first_name", label: "First name", required: true, autoComplete: "given-name" },
  { name: "last_name", label: "Last name", required: true, autoComplete: "family-name" },
  { name: "address_1", label: "Address", required: true, autoComplete: "address-line1", wide: true },
  { name: "address_2", label: "Address line 2", autoComplete: "address-line2", wide: true },
  { name: "city", label: "City", required: true, autoComplete: "address-level2" },
  { name: "postal_code", label: "Postcode", required: true, autoComplete: "postal-code" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", wide: true },
];

const inputClass =
  "w-full border border-[#E8DDCF] bg-white px-3 py-2 text-sm focus:border-brand-pdp focus:outline-none";

// Posts { email, shipping_address } to /api/cart/checkout, which places the
// Vendure order (billing address = delivery address, the delivery method picked
// in the bag) and returns it; then opens /order/<code>.
export default function CheckoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const router = useRouter();

  const placeOrder = async (event) => {
    event.preventDefault();
    const { email, ...address } = Object.fromEntries(new FormData(event.currentTarget));

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping_address: { ...address, country_code: "gb" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Checkout ${res.status}`);
      setOrder(data.order);
      // Empty bag in the header, then the confirmation page (read back from Vendure).
      window.dispatchEvent(new Event("cart:updated"));
      router.push(`/order/${data.order.code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-brand-pdp">Thank you for your order!</h2>
        <p className="text-sm">
          Order <strong>{order.code}</strong> has been placed. Confirmation goes to{" "}
          <strong>{order.email}</strong>.
        </p>
        <p className="text-sm">
          Total: {formatPrice(order.total, order.currency)}
        </p>
        <Link href="/" className="inline-block text-sm text-brand-pdp underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} className="space-y-4">
      <h2 className="text-lg font-semibold">Contact</h2>
      <input
        name="email"
        type="email"
        required
        placeholder="Email *"
        autoComplete="email"
        className={inputClass}
      />

      <h2 className="pt-2 text-lg font-semibold">Delivery address</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <input
            key={field.name}
            name={field.name}
            type={field.type ?? "text"}
            required={field.required}
            autoComplete={field.autoComplete}
            placeholder={`${field.label}${field.required ? " *" : ""}`}
            className={`${inputClass} ${field.wide ? "sm:col-span-2" : ""}`}
          />
        ))}
        <input
          value="United Kingdom"
          disabled
          aria-label="Country"
          className={`${inputClass} text-gray-500 sm:col-span-2`}
        />
      </div>

      <p className="text-xs text-gray-500">
        Billing address is the same as the delivery address. Payment uses Vendure&apos;s test payment method, so no card is charged.
      </p>

      {error && <p className="text-sm text-[#e72618]">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-pdp py-4 text-sm font-semibold uppercase text-white transition-colors hover:bg-brand-pdp-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
