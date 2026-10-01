"use client";

// Generic collapsible section: a title row with a chevron, and a body that
// shows/hides on click. Used for "Product Description" and
// "Ring & Diamond Details" below the Add to Bag button.
import { useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export default function Accordion({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[#E8DDCF] py-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#1F1F1F]"
      >
        {title}
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {/* Only mounted while open, so we don't pay for hidden content. */}
      {open && <div className="pt-4">{children}</div>}
    </div>
  );
}
