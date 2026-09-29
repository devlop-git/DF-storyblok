"use client";

// Transparent, dim loading overlay for in-place client updates (e.g. PDP
// option changes) -- as opposed to `loading.js`, which replaces the whole
// page for a real navigation. Portaled directly to `document.body` so it
// always covers the true viewport, even inside transformed ancestors.
import { createPortal } from "react-dom";
import { RotatingLines } from "react-loader-spinner";

export default function PendingOverlay({ visible }) {
  // Only ever visible after a click, i.e. on the client, so `document` exists.
  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/20">
      <RotatingLines
        visible
        height="56"
        width="56"
        strokeWidth="4"
        strokeColor="#8A8A8A"
        animationDuration="0.75"
        ariaLabel="loading"
      />
    </div>,
    document.body,
  );
}
