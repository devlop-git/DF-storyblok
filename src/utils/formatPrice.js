import { brand } from "@/brands";

// Currency symbol and its position come from the brand config
// (Diamonds Factory: "1,387.50€", Austen & Blake: "£1,387.50").
export function currencySymbol(currency) {
  return brand.currencySymbols[currency] ?? "";
}

// Puts the brand's currency symbol before or after an already formatted amount.
export function withCurrency(value, currency) {
  const symbol = currencySymbol(currency);
  return brand.currencyPosition === "prefix" ? `${symbol}${value}` : `${value}${symbol}`;
}

export function formatPrice(amount, currency) {
  const value = Number(amount ?? 0).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return withCurrency(value, currency);
}
