import { brand } from "@brand/config";

// Markets and their languages come from the active brand (apps/<brand>/brand/config.js).
export const LANGUAGES = brand.languages;

// The market this site runs as; defaults to the brand's main market.
export const MARKET = process.env.NEXT_PUBLIC_MARKET || brand.defaultMarket;
