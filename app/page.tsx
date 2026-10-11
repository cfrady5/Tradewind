import { Hero } from "@/components/home/hero";
import { ChoosePath } from "@/components/home/choose-path";
import { ImpactMetrics } from "@/components/home/impact-metrics";
import { HowItWorks } from "@/components/home/how-it-works";
import { Ecosystem } from "@/components/home/ecosystem";
import { FeaturedOpportunities } from "@/components/home/featured-opportunities";
import { ToolsPreview } from "@/components/home/tools-preview";
import { Results } from "@/components/home/results";
import { ResourcesEvents } from "@/components/home/resources-events";
import { FinalCta } from "@/components/home/final-cta";
import { getEvents, getMetrics, getOpportunities, getResources, getTools, getVehicles } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const now = new Date();
  const [metrics, opportunities, tools, vehicles, events, resources] = await Promise.all([
    getMetrics(), getOpportunities(), getTools(), getVehicles(), getEvents(), getResources(),
  ]);
  return (
    <>
      <Hero now={now} />
      <ChoosePath />
      <ImpactMetrics data={metrics} />
      <HowItWorks />
      <Ecosystem vehicles={vehicles.items} />
      <FeaturedOpportunities data={opportunities} now={now} />
      <ToolsPreview data={tools} />
      <Results metrics={metrics.items} />
      <ResourcesEvents events={events.items} resources={resources.items} now={now} />
      <FinalCta />
    </>
  );
}
