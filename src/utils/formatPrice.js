const CURRENCY_SYMBOL = { GBP: "€", EUR: "€", USD: "€" };

export function formatPrice(amount, currency) {
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  const value = Number(amount ?? 0).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value}${symbol}`;
}
