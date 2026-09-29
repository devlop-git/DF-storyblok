"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopAnnouncementBar({ headerTextStyle }) {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showNavbar) return null;

  return (
    <section className="w-full max-w-full overflow-hidden bg-[#1A1A18] text-white">
      {/* Mobile */}
      <div className="min-h-10 flex justify-center items-center lg:hidden">
        <Link
          href="/sale"
          className={`hover:underline text-base ${headerTextStyle}`}
        >
          SALE
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex w-full h-14 items-center overflow-hidden">
        <div className="flex w-full min-w-0 items-center justify-between text-sm font-medium">
          {/* Sale */}
          <div className="shrink-0 px-2 xl:px-4 uppercase tracking-wide">
            SALE
          </div>

          {/* Trustpilot */}
          <div className="flex min-w-0 items-center gap-2 px-2 xl:px-4">
            <span className="whitespace-nowrap text-[15px] xl:text-[17px] font-bold">
              Hervorragend
            </span>
            <span className="whitespace-nowrap text-[15px] xl:text-[17px]">
              4.3 von 5
            </span>
          </div>

          {/* Klarna */}
          <div className="flex min-w-0 items-center gap-2 px-2 xl:px-4 uppercase">
            <span className="whitespace-nowrap">
              Bezahlen Sie später mit
            </span>
          </div>

          <div className="shrink-0 px-2 xl:px-4 uppercase whitespace-nowrap">
            Preisanpassungsgarantie
          </div>
          <div className="shrink-0 px-2 xl:px-4 uppercase whitespace-nowrap">
            30 Tage kostenloses Rückgaberecht
          </div>
          <div className="shrink-0 px-2 xl:px-4 uppercase whitespace-nowrap">
            Lebenslange Garantie
          </div>
        </div>
      </div>
    </section>
  );
}
