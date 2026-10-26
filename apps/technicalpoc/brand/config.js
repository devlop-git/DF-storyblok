// Technical POC -- Diamonds Factory look, Storyblok "Technical POC" space,
// PLP products from Algolia.
// Colours live in this app's src/app/globals.css (:root).
// Plain JS, no imports: also loaded by next.config.mjs.
const technicalpoc = {
  id: "technicalpoc",
  name: "Technical POC",
  // Header/mobile text shown when there's no logo in the Storyblok "header" story.
  logoText: "DIAMONDS FACTORY",
  phone: "0800 1844 819",

  // Markets this site can run as (NEXT_PUBLIC_MARKET) and their languages.
  defaultMarket: "uk",
  languages: {
    germany: [
      { code: "de", label: "Deutsch" },
      { code: "en", label: "English" },
    ],
    uk: [{ code: "en", label: "English" }],
    netharlands: [
      { code: "nl", label: "Nederlands" },
      { code: "en", label: "English" },
    ],
  },
  // "Shop from" dropdown in the footer.
  shopFromMarkets: [
    "US", "UK", "FR", "IE", "EU", "AU", "NZ", "CH", "ES", "BE", "AT",
    "SE", "NL", "IT", "NO", "DK", "SG", "FI", "PL", "CZ", "PT", "AE",
  ],

  // Prices: symbol per API currency, before the amount ("£1,387.50"); the
  // Algolia records are in GBP.
  currencySymbols: { GBP: "£", EUR: "€", USD: "$" },
  currencyPosition: "prefix",

  links: {
    ringSizeGuide: "https://www.diamondsfactory.de/anleitung/ringmass-anleitung",
    priceExplainer: "https://www.diamondsfactory.de/#priceexplaincontent",
  },

  // Top announcement bar (mobile shows `mobileLink`, desktop shows `items`).
  announcement: {
    mobileLink: { label: "SALE", href: "/sale" },
    items: [
      { text: "SALE" },
      { strong: "Hervorragend", text: "4.3 von 5" },
      { text: "Bezahlen Sie später mit" },
      { text: "Preisanpassungsgarantie" },
      { text: "30 Tage kostenloses Rückgaberecht" },
      { text: "Lebenslange Garantie" },
    ],
  },

  copy: {
    newsletterBirthday: "Geburtstag",
  },

  // Hosts product images are served from (next/image remotePatterns).
  imageHosts: ["static.diamondsfactory.com"],
};

// Shared code reads this as: import { brand } from "@brand/config";
export const brand = technicalpoc;
export default brand;
