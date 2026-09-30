import austenblake from "./austenblake.js";
import diamondsfactory from "./diamondsfactory.js";

// Which brand this build/dev server is: NEXT_PUBLIC_BRAND in the env file
// (unset or "diamondsfactory" -> Diamonds Factory, "austenblake" -> Austen & Blake).
// NEXT_PUBLIC_ values are written into the code at build time, and the
// comparison below lets the bundler drop the other brand's config entirely,
// so each build only contains its own brand. Add a new brand as another branch.
// Plain relative imports (no "@/"): next.config.mjs loads this file too.
export const brand =
  process.env.NEXT_PUBLIC_BRAND === "austenblake" ? austenblake : diamondsfactory;
