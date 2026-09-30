import austenblake from "./austenblake.js";
import diamondsfactory from "./diamondsfactory.js";

// Which brand this build/dev server is: NEXT_PUBLIC_BRAND in the env file
// (.env.local for Diamonds Factory, .env.austenblake for Austen & Blake).
// NEXT_PUBLIC_ so client components get the same value.
// Plain relative imports (no "@/"): next.config.mjs loads this file too.
export const BRANDS = { diamondsfactory, austenblake };

export const brand = BRANDS[process.env.NEXT_PUBLIC_BRAND] ?? diamondsfactory;
