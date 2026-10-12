import type { Metadata } from "next";
import { AislePage, TwoUp } from "@/components/content/aisle-page";
import { Bullets, Pending } from "@/components/content/detail-layout";

export const revalidate = 300;
export const metadata: Metadata = { title: "Prototype Transition Aisle", description: "A Marketplace aisle that helps completed, competitively awarded prototypes become easier for government teams to discover, compare and transition.", alternates: { canonical: "/marketplace/prototype-transition" } };

export default function Page() {
  return (
    <AislePage
      title="Prototype Transition Aisle"
      href="/marketplace/prototype-transition"
      lead="A dedicated Marketplace aisle for completed prototype efforts that may qualify for follow-on production."
      keyMessage="This aisle helps completed, competitively awarded prototypes become easier for government teams to discover, compare and transition."
      faqCategory="Prototype Transition Aisle"
      sections={[
        {
          id: "who-can-submit", title: "Who can submit",
          content: <><p>Teams that have completed a competitively awarded prototype project and want government users to be able to find, compare and transition it.</p><div className="mt-5"><Pending>The aisle&rsquo;s authoritative eligibility terms will be published here once approved.</Pending></div></>,
        },
        {
          id: "criteria", title: "Completed prototype criteria",
          content: (
            <>
              <Bullets items={[
                "The prototype project was awarded competitively.",
                "The prototype project was successfully completed.",
                "The pitch shows what the prototype demonstrated and what follow-on production would deliver.",
              ]} />
              <div className="mt-5"><Pending>Documentation requirements for completion are awaiting program-office approval.</Pending></div>
            </>
          ),
        },
        {
          id: "value", title: "Value for government buyers",
          content: (
            <TwoUp
              left={{ title: "Discover and compare", body: "See completed prototypes side by side, in the same Marketplace you already search." }}
              right={{ title: "Transition faster", body: "Start from prototypes that were competitively awarded and completed, and work with your contracting office on the follow-on path." }}
            />
          ),
        },
        {
          id: "requirements", title: "Submission requirements",
          content: <Bullets items={["One solution per pitch, five minutes or less.", "Identification of the completed prototype project.", "Evidence of what the prototype demonstrated."]} />,
        },
        {
          id: "compliance", title: "Compliance review",
          content: <p>Before assessment, each submission is reviewed to confirm the prototype meets the aisle&rsquo;s criteria. Submissions that pass are assessed against the stated criteria; those that do not are told why.</p>,
        },
      ]}
      steps={[
        { title: "Confirm completion", body: "Identify the competitively awarded prototype project and its completion." },
        { title: "Prepare the pitch", body: "Show what the prototype proved and what production would deliver." },
        { title: "Submit to the aisle", body: "Upload through the portal and select the Prototype Transition Aisle." },
        { title: "Compliance review", body: "Criteria are confirmed before assessment." },
        { title: "Assessment", body: "Awardable prototypes become discoverable to government users." },
      ]}
    />
  );
}
