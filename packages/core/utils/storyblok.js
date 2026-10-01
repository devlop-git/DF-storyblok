// Storyblok equivalents of the Strapi media helper (getStrapiMedia).
// No imports, so client components can use these too.
// Rich text lives in ./richText.js (server-only).

// Empty asset fields still come back as an object with an empty `filename`,
// so normalise them to null to keep `image && <Image … />` checks working.
export function asset(value) {
  return value?.filename ? value : null;
}

// Multi-asset fields are arrays; the Strapi components used `[0]`.
export function firstAsset(list) {
  return Array.isArray(list) ? (list.find((a) => a?.filename) ?? null) : asset(list);
}

// Asset URLs look like https://a.storyblok.com/f/<space>/<width>x<height>/<hash>/<name>
export function assetSize(value) {
  const match = value?.filename?.match(/\/(\d+)x(\d+)\//);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 800, height: 600 };
}

// Number fields are returned as strings ("4"); empty ones as "".
export function toNumber(value) {
  return value === "" || value == null ? NaN : Number(value);
}
