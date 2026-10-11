import { cache } from "react";
import { getSupabase } from "./supabase";
import type {
  AiTool, Award, ContractVehicle, EventItem, Faq, Loaded, Metric, Opportunity, Prompt, Resource, Solution,
} from "./types";
import { metrics } from "./fixtures/metrics";
import { opportunities } from "./fixtures/opportunities";
import { solutions } from "./fixtures/solutions";
import { vehicles } from "./fixtures/vehicles";
import { tools } from "./fixtures/tools";
import { prompts } from "./fixtures/prompts";
import { faqs } from "./fixtures/faqs";
import { events, resources } from "./fixtures/resources";

export * from "./types";

/** snake_case row → camelCase object */
const camel = (row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v]));

/**
 * Reads published rows from Supabase. Falls back to development fixtures when Supabase
 * isn't configured or the query fails — the returned `source` drives the visible notice.
 */
async function load<T>(table: string, fallback: T[], order?: { column: string; ascending?: boolean }): Promise<Loaded<T>> {
  const sb = getSupabase();
  if (!sb) return { items: fallback, source: "development" };
  let q = sb.from(table).select("*");
  if (order) q = q.order(order.column, { ascending: order.ascending ?? true });
  const { data, error } = await q;
  if (error) {
    console.error(`[data] ${table}:`, error.message);
    return { items: fallback, source: "development" };
  }
  return { items: (data ?? []).map((r) => camel(r) as T), source: "supabase" };
}

export const getMetrics = cache(() => load<Metric>("public_metrics", metrics, { column: "sort_order" }));
export const getOpportunities = cache(() => load<Opportunity>("public_opportunities", opportunities, { column: "closes_at" }));
export const getSolutions = cache(() => load<Solution>("public_solutions", solutions, { column: "name" }));
export const getVehicles = cache(() => load<ContractVehicle>("public_contract_vehicles", vehicles, { column: "sort_order" }));
export const getTools = cache(() => load<AiTool>("public_ai_tools", tools, { column: "name" }));
export const getPrompts = cache(() => load<Prompt>("public_prompts", prompts, { column: "sort_order" }));
export const getResources = cache(() => load<Resource>("public_resources", resources, { column: "date", ascending: false }));
export const getEvents = cache(() => load<EventItem>("public_events", events, { column: "starts_at" }));
export const getFaqs = cache(() => load<Faq>("public_faqs", faqs, { column: "sort_order" }));
export const getAwards = cache(() => load<Award>("public_awards", [], { column: "award_date", ascending: false }));

export async function getBySlug<T extends { slug: string }>(loader: () => Promise<Loaded<T>>, slug: string) {
  const { items, source } = await loader();
  return { item: items.find((i) => i.slug === slug), source };
}
