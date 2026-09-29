import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import MarketDropdown from "@/components/layout/MarketDropdown";
import { getCurrentMarket } from "@/lib/market";
import { getFooter } from "@/services/footer";
import { asset } from "@/utils/storyblok";

// Renders one column's static-page links. Pages flag themselves into a
// footer column in Storyblok (`show_in_footer` + `footer_column`) -- no
// separate list to maintain, no code change needed as pages are added.
function FooterPageLinks({ pages }) {
  return (pages || []).map((page) => (
    <li key={page.path}>
      <Link href={page.path}>{page.title}</Link>
    </li>
  ));
}

// The bottom legal row (Privacy Policy, Terms & Conditions, etc.) is just
// another footer column (`key: "legal"`) rendered inline instead of as a list.
function FooterLegalLinks({ pages }) {
  return (pages || []).map((page) => (
    <Link key={page.path} href={page.path} className="hover:text-white">
      {page.title}
    </Link>
  ));
}

const Footer = async () => {
  let data = null;
  try {
    data = await getFooter();
  } catch (error) {
    // Keep the page working if Storyblok can't be reached.
    console.error("Footer:", error.message);
  }
  if (!data) return null; // no "footer" story in Storyblok yet

  const { footer, columns, pagesByColumn, market } = data;
  const marketCode = market?.slug || getCurrentMarket();
  const logo = asset(footer.logo);

  // "Shop From" (the market dropdown) is itself a footer column (`key:
  // "shop_from"`) so editors can switch it off via its `active` flag, same as
  // any other column -- inactive columns are already filtered out.
  const shopFromColumn = columns.find((column) => column.content.key === "shop_from");
  const legalColumn = columns.find((column) => column.content.key === "legal");
  const staticColumns = columns.filter(
    (column) => column.content.key !== "shop_from" && column.content.key !== "legal",
  );

  return (
    <footer className="bg-[#171715] text-white mt-6">
      <div className="max-w-7xl mx-auto px-8 py-14">
        {/* Top Footer */}

        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-12">
          {/* Brand */}

          <div>
            {logo && (
              <Image src={logo.filename} alt={logo.alt || "Logo"} width={150} height={50} />
            )}

            <div className="flex gap-4 my-10">
              {footer.InstagramLink && (
                <a
                  href={footer.InstagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-pink-500 transition"
                >
                  <FaInstagram size={20} />
                </a>
              )}

              {footer.FacebookURL && (
                <a
                  href={footer.FacebookURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:text-blue-500 transition"
                >
                  <FaFacebookF size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Editor-managed columns -- heading, count and order all come from
              Storyblok (footer.columns), no hardcoded list here. */}

          {staticColumns.map((column) => (
            <div key={column.uuid}>
              <h3 className="font-semibold uppercase mb-6">{column.content.heading}</h3>

              <ul className="space-y-3 text-gray-300">
                <FooterPageLinks pages={pagesByColumn[column.uuid]} />
              </ul>
            </div>
          ))}

          {shopFromColumn && (
            <div>
              <h3 className="font-semibold uppercase mb-6">{shopFromColumn.content.heading}</h3>

              <MarketDropdown market={marketCode} />
            </div>
          )}
        </div>

        {/* Bottom */}

        <div className="border-t border-gray-700 mt-14 pt-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <FooterLegalLinks pages={pagesByColumn[legalColumn?.uuid]} />
            </div>

            <p className="text-xs text-gray-400 max-w-3xl">
              {footer.Copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
