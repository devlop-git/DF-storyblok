// Central map from a locale or market code to the ISO 3166-1 alpha-2 code
// `flag-icons` (the `fi fi-<code>` class) expects -- one place to add a new
// country so every dropdown (language, market/"shop from") stays in sync.
const countryCodes = {
  // Site locales
  en: "gb",
  de: "de",
  fr: "fr",
  nl: "nl",

  // LANGUAGES keys (src/constants/languages.js) -- the full market name, lowercase.
  germany: "de",
  uk: "gb",
  netharlands: "nl",

  // Markets ("shop from")
  US: "us",
  UK: "gb",
  FR: "fr",
  IE: "ie",
  EU: "eu",
  AU: "au",
  NZ: "nz",
  CH: "ch",
  ES: "es",
  BE: "be",
  AT: "at",
  SE: "se",
  NL: "nl",
  IT: "it",
  NO: "no",
  DK: "dk",
  SG: "sg",
  FI: "fi",
  PL: "pl",
  CZ: "cz",
  PT: "pt",
  AE: "ae",
};

export default countryCodes;
