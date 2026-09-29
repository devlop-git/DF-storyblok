"use client";

export default function BottomSheet({ isOpen, onClose, children, footer }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-white transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 rounded-t-3xl bg-white py-4">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4">{children}</div>

        {/* Fixed Footer */}
        <div className=" bg-white p-4">{footer}</div>
      </div>
    </>
  );
}
