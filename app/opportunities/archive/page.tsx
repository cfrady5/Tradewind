import type { Metadata } from "next";
import { OpportunitiesPage } from "@/components/layout/opportunities-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "Archived Opportunities", description: "Closed and historical Tradewinds opportunities.", alternates: { canonical: "/opportunities/archive" } };

export default function Page() {
  return (
    <OpportunitiesPage
      title="Archived opportunities"
      lead="Closed opportunities move here automatically when their deadline passes. Historical records are retained, never deleted."
      crumbs={[{ label: "Archive", href: "/opportunities/archive" }]}
      defaultStatus="closed"
    />
  );
}
