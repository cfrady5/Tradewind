import type { Metadata } from "next";
import { OpportunitiesPage } from "@/components/layout/opportunities-page";

export const revalidate = 300;
export const metadata: Metadata = { title: "Shopping Notices", description: "Buyer-issued requests seeking awardable solutions in the Tradewinds Solutions Marketplace.", alternates: { canonical: "/opportunities/shopping-notices" } };

export default function Page() {
  return (
    <OpportunitiesPage
      title="Shopping Notices"
      lead="Requests from government buyers seeking solutions for a specific need — often with a defined collection window."
      crumbs={[{ label: "Shopping Notices", href: "/opportunities/shopping-notices" }]}
      lockType="shopping-notice"
      defaultStatus="all"
    />
  );
}
