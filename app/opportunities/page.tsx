import type { Metadata } from "next";
import { OpportunitiesPage } from "@/components/layout/opportunities-page";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Opportunities",
  description: "Open Tradewinds calls for solutions — Marketplace collection periods, Special Topics, Shopping Notices and curated opportunities — with live status and deadlines.",
  alternates: { canonical: "/opportunities" },
};

export default function Page() {
  return <OpportunitiesPage title="Opportunities" lead="Every open call for solutions in one place — with live status, deadlines and sponsors." crumbs={[]} />;
}
