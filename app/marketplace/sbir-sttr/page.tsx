import type { Metadata } from "next";
import { AislePage, TwoUp } from "@/components/content/aisle-page";
import { Bullets, Pending } from "@/components/content/detail-layout";

export const revalidate = 300;
export const metadata: Metadata = { title: "SBIR/STTR Aisle", description: "A Marketplace aisle that helps government teams find pre-competed SBIR/STTR-developed technologies that can move toward Phase III faster.", alternates: { canonical: "/marketplace/sbir-sttr" } };

export default function Page() {
  return (
    <AislePage
      title="SBIR/STTR Aisle"
      href="/marketplace/sbir-sttr"
      lead="A dedicated Marketplace aisle for Phase III-eligible technologies developed under the Small Business Innovation Research and Small Business Technology Transfer programs."
      keyMessage="This aisle helps government teams find pre-competed SBIR/STTR-developed technologies that can move toward Phase III use faster."
      faqCategory="SBIR/STTR Aisle"
      sections={[
        {
          id: "who-can-submit", title: "Who can submit",
          content: <><p>Small businesses whose technology was developed under an SBIR or STTR funding agreement and that are pursuing Phase III use with government customers.</p><div className="mt-5"><Pending>The aisle&rsquo;s authoritative eligibility terms will be published here once approved.</Pending></div></>,
        },
        {
          id: "why", title: "Why participate",
          content: (
            <TwoUp
              left={{ title: "For vendors", body: "Put Phase III-eligible technology in front of government users who are already searching for awardable capability — with one five-minute pitch." }}
              right={{ title: "For government users", body: "Find SBIR/STTR-developed technologies that have been assessed and are ready to move toward Phase III, in the same place you search everything else." }}
            />
          ),
        },
        {
          id: "eligibility", title: "Eligibility criteria",
          content: (
            <>
              <Bullets items={[
                "The technology derives from, extends or completes work performed under a prior SBIR or STTR funding agreement.",
                "The submission identifies the originating SBIR/STTR award.",
                "The pitch meets the standard Marketplace format: one solution, five minutes or less.",
              ]} />
              <div className="mt-5"><Pending>Additional eligibility details, such as required documentation, are awaiting program-office approval.</Pending></div>
            </>
          ),
        },
        {
          id: "compliance", title: "Compliance review",
          content: <p>Before assessment, each submission is reviewed to confirm it meets the aisle&rsquo;s eligibility requirements. Submissions that pass are assessed against the stated criteria; those that do not are told why.</p>,
        },
      ]}
      steps={[
        { title: "Confirm eligibility", body: "Identify the SBIR/STTR award your technology derives from." },
        { title: "Prepare the pitch", body: "One solution, five minutes or less, referencing the originating award." },
        { title: "Submit to the aisle", body: "Upload through the solution-provider portal and select the SBIR/STTR Aisle." },
        { title: "Compliance review", body: "Eligibility is confirmed before assessment." },
        { title: "Assessment", body: "Awardable solutions become discoverable to government users." },
      ]}
    />
  );
}
