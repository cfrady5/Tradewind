import type { MetadataRoute } from "next";
import { getOpportunities, getTools, getVehicles } from "@/lib/data";
import { NAV, SITE } from "@/lib/site-config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", ...new Set(NAV.flatMap((g) => [g.href, ...g.links.map((l) => l.href)]))];
  const [opps, tools, vehicles] = await Promise.all([getOpportunities(), getTools(), getVehicles()]);
  const dynamic = [
    ...opps.items.map((o) => `/opportunities/${o.slug}`),
    ...tools.items.map((t) => `/ai-playground/${t.slug}`),
    ...vehicles.items.map((v) => `/contract-vehicles/${v.slug}`),
  ];
  const now = new Date();
  return [...new Set([...staticPaths, ...dynamic])].map((p) => ({
    url: SITE.url + p,
    lastModified: now,
    changeFrequency: p.startsWith("/opportunities") ? "daily" : "weekly",
    priority: p === "/" ? 1 : p.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
