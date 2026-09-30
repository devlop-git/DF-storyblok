// Austen & Blake. Text/links/markets from austenblake.com.
// Colours live in src/app/globals.css ([data-brand="austenblake"]) and are
// PLACEHOLDERS until the real brand hex codes are provided.
// Plain JS, no imports: also loaded by next.config.mjs.
const austenblake = {
  id: "austenblake",
  name: "Austen & Blake",
  logoText: "AUSTEN & BLAKE",
  phone: "020 7660 1529",

  defaultMarket: "uk",
  languages: {
    uk: [{ code: "en", label: "English" }],
  },
  shopFromMarkets: ["UK", "IE", "AU", "NZ", "US", "CA", "AE"],

  currencySymbols: { GBP: "£", EUR: "€", USD: "$" },
  currencyPosition: "prefix",

  links: {
    ringSizeGuide: "https://www.austenblake.com/education/ring-size-guide",
    priceExplainer: "https://www.austenblake.com/education/diamond-guide",
  },

  announcement: {
    mobileLink: { label: "0% APR FINANCE AVAILABLE", href: "/finance" },
    items: [
      { text: "Save up to £150 in-store | Book your appointment" },
      { text: "0% APR finance available" },
      { text: "Free 30-day returns" },
      { text: "Free resizing" },
    ],
  },

  copy: {
    newsletterBirthday: "Birthday",
  },

  // TODO: confirm where Austen & Blake product images are served from.
  imageHosts: ["static.diamondsfactory.com", "www.austenblake.com"],
};

export default austenblake;
