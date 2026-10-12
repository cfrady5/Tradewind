import { Hero } from "@/components/home/hero";
import { ChoosePath } from "@/components/home/choose-path";
import { Why } from "@/components/home/why";
import { FeaturedOpportunities } from "@/components/home/featured-opportunities";
import { Vehicles } from "@/components/home/vehicles";
import { ToolsPreview } from "@/components/home/tools-preview";
import { Results } from "@/components/home/results";
import { FinalCta } from "@/components/home/final-cta";
import { getMetrics, getOpportunities, getTools, getVehicles } from "@/lib/data";

export const revalidate = 300;

/**
 * Homepage in the rebuild brief's order (§6.1, §11): hero with the metric grid directly beneath,
 * user pathways, why the platform exists, opportunities, contract
 * vehicles, AI Playground, proof, final call to action.
 */
export default async function HomePage() {
  const now = new Date();
  const [metrics, opportunities, tools, vehicles] = await Promise.all([getMetrics(), getOpportunities(), getTools(), getVehicles()]);
  return (
    <>
      <Hero metrics={metrics.items} />
      <ChoosePath />
      <Why />
      <FeaturedOpportunities data={opportunities} now={now} />
      <Vehicles vehicles={vehicles.items} />
      <ToolsPreview data={tools} />
      <Results metrics={metrics.items} />
      <FinalCta />
    </>
  );
}
