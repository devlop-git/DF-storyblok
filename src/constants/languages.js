import { brand } from "@/brands";

// Markets and their languages come from the active brand (src/brands/*.js).
export const LANGUAGES = brand.languages;

// The market this site runs as; defaults to the brand's main market.
export const MARKET = process.env.NEXT_PUBLIC_MARKET || brand.defaultMarket;
