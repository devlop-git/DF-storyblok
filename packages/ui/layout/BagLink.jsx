"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";

// Header bag icon: links to the checkout and shows how many items are in the
// Vendure cart (GET /api/cart). Refreshes when the cart changes on the page
// (Add to Bag, quantity, remove, order placed) via the "cart:updated" event.
export default function BagLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => active && setCount(data.count ?? 0))
        .catch(() => {});
    load();
    window.addEventListener("cart:updated", load);
    return () => {
      active = false;
      window.removeEventListener("cart:updated", load);
    };
  }, []);

  return (
    <Link
      href="/checkout"
      aria-label={count ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag"}
      className="relative hover:text-brand-primary"
    >
      <HiOutlineShoppingBag className="text-lg lg:text-2xl" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
