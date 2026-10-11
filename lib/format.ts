export function formatMetric(n: number, format: "number" | "currency-compact") {
  if (format === "currency-compact") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(n);
  }
  return new Intl.NumberFormat("en-US").format(n);
}
