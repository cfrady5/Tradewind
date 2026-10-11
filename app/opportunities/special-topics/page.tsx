import type { Metadata } from "next";
import { OpportunitiesPage } from "@/components/layout/opportunities-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "Special Topics", description: "Targeted calls to action from government organizations seeking solutions to specific challenges.", alternates: { canonical: "/opportunities/special-topics" } };

export default function Page() {
  return (
    <OpportunitiesPage
      title="Special Topics"
      lead="Targeted calls to action issued by government organizations to identify innovative solutions for particular challenges."
      crumbs={[{ label: "Special Topics", href: "/opportunities/special-topics" }]}
      lockType="special-topic"
      defaultStatus="all"
    />
  );
}
