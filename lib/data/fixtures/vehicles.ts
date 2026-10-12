import type { ContractVehicle } from "../types";
import { EXTERNAL } from "@/lib/site-config";

export const vehicles: ContractVehicle[] = [
  {
    slug: "test-and-evaluation",
    name: "AI Test & Evaluation Services BPA",
    shortName: "T&E",
    vehicleType: "Blanket Purchase Agreement",
    status: "active",
    tagline: "Test technology, tools and services for AI and autonomy.",
    overview:
      "The AI Test and Evaluation Services BPA gives government teams a ready route to the tools, environments and expertise needed to test AI models and autonomous systems before and after they field.",
    whoItServes: "All agencies of the U.S. Government with AI or autonomy test and evaluation needs.",
    background:
      "The CDAO Test and Evaluation Services Blanket Purchase Agreement meets Department needs for test technology and tools for AI and autonomy applications. CDAO manages the BPA in partnership with its prime contractors and in coordination with Army Contracting Command – Rock Island (ACC-RI).",
    capabilityLabel: "Services covered",
    capabilityCategories: [
      "Commercial AI tools and services",
      "Development of new AI test tools",
      "Integration into environments",
      "Operation and support",
      "Use of tools to test models and software",
    ],
    scope: [
      "Test technology and tools",
      "Data set development and curation",
      "Test harness development",
      "Model output analysis",
      "Test planning, documentation and reporting",
      "Targeted T&E and independent verification & validation (IV&V)",
      "Operational T&E",
      "Human factors and user-acceptance T&E",
    ],
    eligibleUsers: "Open for ordering to all agencies of the U.S. Government in support of AI test and evaluation.",
    orderingProcess: [
      "Define the T&E requirement and confirm it falls within BPA scope",
      "Contact the Tradewinds team to discuss scope and ordering",
      "Develop the order package with ACC-RI",
      "Compete among BPA holders and award the call order",
    ],
    availability: "Active — accepting orders",
    documents: [{ label: "T&E Services one-pager (AI.mil)", url: "https://www.ai.mil/docs/TE_One_Pager.pdf" }],
    contacts: [{ label: "Tradewinds vehicles team", email: EXTERNAL.successEmail }],
    pendingFields: ["Ordering guide", "Current BPA holder list", "Ordering period of performance"],
  },
  {
    slug: "draid",
    name: "Data Readiness for AI Development",
    shortName: "DRAID",
    vehicleType: "Basic Ordering Agreement",
    status: "pending-confirmation",
    tagline: "Data readiness services that prepare data for AI development.",
    overview:
      "DRAID is a Basic Ordering Agreement for the data work that AI depends on — engineering, curation, quality, governance and integration — so programs start model development with data that is ready.",
    whoItServes: "Programs that need their data prepared, governed and integrated before AI development.",
    background:
      "DRAID was established under the Joint Artificial Intelligence Center (JAIC), a CDAO predecessor organization, to provide data-readiness services that prepare data for AI development.",
    scope: ["Data readiness and preparation services for AI development"],
    capabilityLabel: "Covered capabilities",
    capabilityCategories: [
      "Data science", "Data engineering", "Data architecture", "Data acquisition and curation", "Data quality and analysis",
      "Synthetic data", "Data anonymization", "Software development", "Enterprise information management", "Governance", "Cloud integration",
    ],
    updateNotice: "On-ramp and ordering status are being confirmed with the program office. Contact the vehicles team before planning an order.",
    eligibleUsers: "Awaiting confirmation from the program office.",
    orderingProcess: ["Contact the Tradewinds vehicles team to confirm current ordering availability"],
    availability: "Current ordering status awaiting confirmation",
    documents: [],
    contacts: [{ label: "Tradewinds vehicles team", email: EXTERNAL.successEmail }],
    historicalNotes: "Established under JAIC. Historical information is shown separately from current ordering guidance.",
    pendingFields: ["Eligible users", "Ordering guide", "Holder list", "Official documents"],
  },
  {
    slug: "ai-talent-2",
    name: "AI Talent 2.0",
    shortName: "AI Talent 2.0",
    vehicleType: "Basic Ordering Agreement",
    status: "pending-confirmation",
    tagline: "AI workforce and technical support services.",
    overview:
      "AI Talent 2.0 is a Basic Ordering Agreement that gives government teams access to AI technical expertise and program support when they need it.",
    whoItServes: "Programs that need AI technical or program-management capacity they cannot hire quickly.",
    problem:
      "AI programs depend on specialized technical talent that is scarce and slow to hire. Without it, promising efforts stall between prototype and production.",
    howItHelps:
      "Pre-established agreements with qualified holders shorten the path from identifying a talent gap to having qualified support on task.",
    serviceGroups: [
      { title: "Technical management services", body: "AI and data technical expertise for programs that are building, integrating or sustaining AI capabilities." },
      { title: "Program management services", body: "Program, project and acquisition management support for AI efforts." },
    ],
    scope: ["AI technical management services", "AI program management services"],
    eligibleUsers: "Awaiting confirmation from the program office.",
    orderingProcess: ["Contact the Tradewinds vehicles team for current ordering guidance"],
    availability: "Current ordering status awaiting confirmation",
    documents: [],
    contacts: [{ label: "Tradewinds vehicles team", email: EXTERNAL.successEmail }],
    pendingFields: ["Detailed task areas", "Eligible users", "Ordering guide", "Holder list", "Official documents"],
  },
];
