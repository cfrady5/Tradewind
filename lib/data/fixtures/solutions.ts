import type { Solution } from "../types";

/**
 * ALL ILLUSTRATIVE. The awardable list is restricted to government users today;
 * only metadata the program office approves for public release may populate this
 * directory (Supabase `solutions` where is_public = true).
 */
const rows: [string, string, string, string, string, string][] = [
  // name, summary, focus area, technology category, type, awardable since
  ["Sentinel Change Detection", "Automated change detection across multi-source imagery with analyst review queues.", "Intelligence", "Computer Vision", "Software", "2025-03"],
  ["Ledgerline Contract Insights", "Clause extraction and comparison across contract files with full traceability.", "Business Operations", "NLP & LLMs", "Software", "2024-11"],
  ["Forecast Depot", "Parts-demand forecasting tuned for intermittent connectivity at the edge.", "Logistics & Sustainment", "Predictive Analytics", "Platform", "2025-06"],
  ["Meridian Data Fabric", "Federated data catalog and lineage for mission data across enclaves.", "Decision Advantage", "Data Engineering", "Platform", "2024-08"],
  ["Watchfloor Triage", "Prioritizes network alerts and summarizes incidents for cyber analysts.", "Cyber", "Cybersecurity Analytics", "Software", "2025-01"],
  ["Pathfinder Planning Assistant", "Course-of-action comparison with transparent assumptions and constraints.", "Decision Advantage", "Decision Support", "Software", "2025-09"],
  ["Rotorwise Maintenance", "Condition-based maintenance predictions from aviation sensor data.", "Readiness", "Predictive Analytics", "Software", "2024-05"],
  ["Atlas Terrain Engine", "Terrain analysis and mobility modeling for planning cells.", "Intelligence", "Geospatial Intelligence", "Platform", "2025-04"],
  ["Clearwater Document AI", "Secure summarization and Q&A over policy and acquisition documents.", "Business Operations", "NLP & LLMs", "Software", "2025-07"],
  ["Beacon Model Evaluation", "Robustness, bias and drift testing harness for deployed models.", "Responsible AI", "Test & Evaluation", "Services", "2024-12"],
  ["Halyard Autonomy Stack", "Perception and navigation modules for small uncrewed systems.", "Autonomy", "Autonomy", "Hardware-enabled", "2025-02"],
  ["Northstar Workforce Analytics", "Skills inventory and readiness analytics for workforce planning.", "Business Operations", "Decision Support", "Software", "2024-09"],
  ["Tidewater Sensor Fusion", "Fuses radar, EO/IR and AIS tracks into a common maritime picture.", "Intelligence", "Data Engineering", "Platform", "2025-05"],
  ["Keel Supply Visibility", "End-to-end supply chain visibility with risk alerts.", "Logistics & Sustainment", "Data Engineering", "Platform", "2024-10"],
  ["Signal Translate", "Speech-to-text and translation for low-resource languages.", "Intelligence", "NLP & LLMs", "Software", "2025-08"],
  ["Granite Data Labeling", "Managed labeling with quality controls for imagery and text.", "Responsible AI", "Data Engineering", "Services", "2024-07"],
  ["Vantage Readiness Dashboard", "Unit readiness reporting from authoritative data sources.", "Readiness", "Decision Support", "Software", "2025-03"],
  ["Crosswind Edge Inference", "Model compression and deployment to rugged edge devices.", "Autonomy", "Edge AI", "Hardware-enabled", "2025-10"],
  ["Bastion Insider Risk", "Behavioral analytics for insider-risk programs with privacy controls.", "Cyber", "Cybersecurity Analytics", "Software", "2024-06"],
  ["Harbor Financial Audit AI", "Anomaly detection supporting financial audit remediation.", "Business Operations", "Predictive Analytics", "Software", "2025-06"],
  ["Lattice Knowledge Graph", "Entity resolution and graph analytics across disparate sources.", "Decision Advantage", "Data Engineering", "Platform", "2024-04"],
  ["Ridge Synthetic Data", "Privacy-preserving synthetic data generation for model training.", "Responsible AI", "Data Engineering", "Software", "2025-09"],
  ["Compass Wargame Analytics", "Captures and analyzes wargame decisions to inform planning.", "Decision Advantage", "Decision Support", "Services", "2025-01"],
  ["Skyline Imagery Search", "Natural-language search across archived imagery collections.", "Intelligence", "Computer Vision", "Software", "2025-11"],
];

export const solutions: Solution[] = rows.map(([name, summary, focusArea, technologyCategory, solutionType, awardableSince], i) => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  sample: true,
  name,
  company: `Sample Vendor ${String.fromCharCode(65 + (i % 26))}`,
  summary,
  focusArea,
  technologyCategory,
  solutionType,
  awardableSince,
  aisle: (["General", "General", "SBIR/STTR", "General", "Prototype Transition"] as const)[i % 5],
  businessSize: (["Small", "Small", "Non-traditional", "Large", "Academia"] as const)[i % 5],
  trl: 4 + (i % 5),
  listingStatus: i === 7 ? "Updated" : i === 15 ? "Archived" : "Awardable",
}));
