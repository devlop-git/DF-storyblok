// Turns price and carat phrases in a search into range filters, e.g.
// "oval ring under £1500" -> { query: "oval ring", range: { fromPrice: ":1500" } }
// Words such as shape, metal or stone type are understood by Algolia rules on the index instead.

const NUM = "(\\d+(?:[.,]\\d+)?)\\s*(k)?";
const toNumber = (value, k) => Number(value.replace(",", "")) * (k ? 1000 : 1);

const PRICE_PATTERNS = [
  { re: new RegExp(`\\bbetween\\s+£?${NUM}\\s*(?:and|-|to)\\s*£?${NUM}`, "i"), range: (m) => `${toNumber(m[1], m[2])}:${toNumber(m[3], m[4])}` },
  { re: new RegExp(`\\b(?:under|below|less than|max|up to)\\s+£?${NUM}`, "i"), range: (m) => `:${toNumber(m[1], m[2])}` },
  { re: new RegExp(`\\b(?:over|above|more than|min|from)\\s+£?${NUM}`, "i"), range: (m) => `${toNumber(m[1], m[2])}:` },
  { re: new RegExp(`£${NUM}\\s*(?:-|to)\\s*£?${NUM}`, "i"), range: (m) => `${toNumber(m[1], m[2])}:${toNumber(m[3], m[4])}` },
];

// "1 carat", "1.5ct", "0.5 ct" -> carat range around the value
const CARAT_PATTERN = /\b(\d+(?:\.\d+)?)\s*(?:ct|carats?)\b/i;
// In the UK "9ct" / "18ct" means gold karat, not diamond weight
const MAX_CARAT = 6;

export function parseQuery(input) {
  let query = input;
  const range = {};
  const understood = [];

  for (const { re, range: toRange } of PRICE_PATTERNS) {
    const m = query.match(re);
    if (m) {
      range.fromPrice = toRange(m);
      understood.push(m[0].trim());
      query = query.replace(m[0], " ");
      break;
    }
  }

  const carat = query.match(CARAT_PATTERN);
  if (carat && Number(carat[1]) <= MAX_CARAT) {
    const value = Number(carat[1]);
    range.carat = `${Math.max(0, value - 0.05).toFixed(2)}:${(value + 0.05).toFixed(2)}`;
    understood.push(carat[0].trim());
    query = query.replace(carat[0], " ");
  }

  return { query: query.replace(/\s+/g, " ").trim(), range, understood };
}
