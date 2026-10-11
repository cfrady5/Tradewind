import type { Metric } from "../types";

/**
 * Seed values found on the live site / public reporting during the audit.
 * verified=false until the program office confirms each figure and its methodology.
 */
export const metrics: Metric[] = [
  { key: "submitted", label: "Solutions submitted", value: 2384, format: "number", asOf: "2025-11-30", reportingPeriod: "Cumulative through Nov 2025", source: "tradewindai.com Marketplace page", verified: false },
  { key: "awardable", label: "Solutions determined awardable", value: 836, format: "number", asOf: "2025-11-30", reportingPeriod: "Cumulative through Nov 2025", source: "tradewindai.com Marketplace page", verified: false },
  { key: "activities", label: "Participating DoW activities", value: 125, format: "number", asOf: "2025-11-30", reportingPeriod: "Cumulative through Nov 2025", source: "tradewindai.com Marketplace page", verified: false },
  { key: "award-value", label: "Contract awards facilitated", value: 3_260_000_000, format: "currency-compact", asOf: "2026-02-28", reportingPeriod: "Cumulative through Feb 2026", source: "Public press reporting — pending program office confirmation", verified: false },
];
