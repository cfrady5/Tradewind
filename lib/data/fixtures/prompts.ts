import type { Prompt } from "../types";

/**
 * ILLUSTRATIVE SUBSET. The live 78-prompt library is migrated into Supabase `prompts`
 * after content verification (docs/01-AUDIT.md §5).
 */
const p = (slug: string, category: string, title: string, description: string, body: string, usageNotes?: string): Prompt =>
  ({ slug, category, title, description, body, usageNotes, sample: true });

const list: Prompt[] = [
  p("problem-statement", "Requirements", "Write an outcome-based problem statement",
    "Reframe a capability request as a measurable mission problem.",
    `You are an acquisition requirements specialist. Rewrite the following capability request as an outcome-based problem statement.

Include:
1. The mission problem in one sentence
2. Who is affected and how
3. Measurable outcomes that would indicate success
4. Constraints (security, connectivity, timeline)
5. What is explicitly out of scope

Avoid naming specific products or prescribing technical solutions.

Capability request:
[PASTE REQUEST]`,
    "Outcome-based statements make Marketplace searches and Special Topics more effective."),
  p("market-research-summary", "Market Research", "Summarize market research findings",
    "Produce a structured market research summary from your notes.",
    `Act as a contracting market research analyst. Using the notes below, draft a market research summary with these sections: Background, Requirement Summary, Sources Reviewed, Capabilities Identified, Small Business Considerations, Conclusions and Recommended Next Steps. Flag any statement that is not supported by the notes as [NEEDS SOURCE].

Notes:
[PASTE NOTES]`),
  p("evaluation-criteria", "Evaluation", "Draft evaluation criteria",
    "Generate candidate evaluation factors tied to mission outcomes.",
    `Propose 4–6 evaluation factors for the requirement below. For each factor give: name, what it measures, why it matters to the mission outcome, and an example of a strong vs. weak response. Keep factors distinct and non-overlapping.

Requirement:
[PASTE REQUIREMENT]`),
  p("pitch-outline", "Submissions", "Outline a five-minute pitch video",
    "Structure a Marketplace pitch for clarity within five minutes.",
    `Help me outline a pitch video for the Tradewinds Solutions Marketplace that must not exceed 5:00 minutes. Produce a timed outline (minute:second) covering: the mission problem, our solution, evidence it works (data, deployments, results), differentiation, maturity and deployment considerations, and a closing summary. Flag anything that is marketing language rather than evidence.

About our solution:
[DESCRIBE SOLUTION]`,
    "For solution providers. Always confirm against the current official submission guidance."),
  p("vendor-questions", "Market Research", "Prepare vendor discussion questions",
    "Generate focused questions for a vendor demonstration.",
    `Generate 12 questions to ask a vendor during a capability demonstration for the requirement below. Group them into: mission fit, technical performance, data and security, integration, sustainment and cost drivers, and responsible AI. Avoid yes/no questions.

Requirement:
[PASTE REQUIREMENT]`),
  p("plain-language", "Communication", "Convert to plain language",
    "Rewrite technical or policy text for a non-specialist audience.",
    `Rewrite the text below in plain language for a non-specialist reader. Keep every requirement and obligation intact. Use short sentences, active voice and define any acronym on first use. Then list any terms you were unsure how to simplify.

Text:
[PASTE TEXT]`),
  p("risk-register", "Program Management", "Build an AI project risk register",
    "Identify and rate risks for an AI acquisition.",
    `Create a risk register for the AI project described below. For each risk include: description, category (data, technical, schedule, cost, security, responsible AI, adoption), likelihood (1–5), impact (1–5), mitigation and owner role. List at least 10 risks.

Project:
[DESCRIBE PROJECT]`),
  p("data-readiness", "Data", "Assess data readiness",
    "Evaluate whether available data supports an AI use case.",
    `Assess data readiness for the AI use case below. Address: availability, volume, labeling, quality, representativeness, access and permissions, security classification, and governance. Rate each area Red/Amber/Green with a one-line rationale, then recommend the three most important actions.

Use case and data description:
[DESCRIBE]`),
  p("brief-summary", "Communication", "Summarize for a decision brief",
    "Condense a long document into a one-page decision brief.",
    `Summarize the document below into a one-page decision brief with: Purpose, Bottom Line Up Front, Background, Options (with pros/cons), Recommendation, and Decision Requested. Do not add information that is not in the document.

Document:
[PASTE DOCUMENT]`),
  p("sow-to-pws", "Requirements", "Convert a SOW task into PWS language",
    "Shift task-based language to performance-based outcomes.",
    `Convert the statement-of-work tasks below into performance work statement language. For each task, state the required outcome, a performance standard, and an acceptable quality level. Note any task that cannot reasonably be made performance-based and explain why.

Tasks:
[PASTE TASKS]`),
  p("lessons-learned", "Program Management", "Capture lessons learned",
    "Turn after-action notes into reusable lessons.",
    `From the notes below, extract lessons learned. For each: what happened, why it mattered, what we would repeat or change, and who should know. Finish with the three lessons most useful to another acquisition team.

Notes:
[PASTE NOTES]`),
  p("responsible-ai-review", "Governance", "Responsible AI review questions",
    "Generate review questions for responsible AI considerations.",
    `For the AI capability described below, generate review questions covering: intended use and limitations, data provenance, bias and fairness testing, human oversight, transparency to users, security, and monitoring after deployment. Indicate which questions should be asked of the vendor vs. the government team.

Capability:
[DESCRIBE CAPABILITY]`),
];

/** Brief §6.12 prompt fields: who it is for, what to paste in, what comes out. */
const META: Record<string, Pick<Prompt, "intendedUser" | "inputsRequired" | "outputFormat" | "warnings">> = {
  "problem-statement": { intendedUser: "Requirements owners and program managers", inputsRequired: "The capability request as written", outputFormat: "Five-part problem statement" },
  "market-research-summary": { intendedUser: "Contracting officers and market research analysts", inputsRequired: "Your market research notes", outputFormat: "Sectioned summary with unsupported claims flagged" },
  "evaluation-criteria": { intendedUser: "Source selection and evaluation teams", inputsRequired: "Requirement summary and priorities", outputFormat: "Criteria with definitions and rating guidance" },
  "pitch-outline": { intendedUser: "Solution providers", inputsRequired: "Solution description, evidence and the mission problem", outputFormat: "Timed outline for a five-minute video" },
  "vendor-questions": { intendedUser: "Program and contracting teams", inputsRequired: "Requirement summary and the vendor's materials", outputFormat: "Prioritized question list" },
  "plain-language": { intendedUser: "Anyone writing for a broad audience", inputsRequired: "The text to simplify", outputFormat: "Plain-language rewrite" },
  "risk-register": { intendedUser: "AI program and project managers", inputsRequired: "Project description and known constraints", outputFormat: "Risk register table" },
  "data-readiness": { intendedUser: "Data owners and AI program leads", inputsRequired: "Description of the data sources and intended use", outputFormat: "Readiness assessment with gaps and next steps" },
  "brief-summary": { intendedUser: "Staff preparing decision briefs", inputsRequired: "Source material for the decision", outputFormat: "One-page decision summary" },
  "sow-to-pws": { intendedUser: "Requirements and contracting teams", inputsRequired: "The SOW task language", outputFormat: "Performance-based PWS task with standards" },
  "lessons-learned": { intendedUser: "Program teams closing out a phase", inputsRequired: "Notes from the effort", outputFormat: "Structured lessons-learned record" },
  "responsible-ai-review": { intendedUser: "Program leads and AI assurance reviewers", inputsRequired: "Description of the AI capability and its use", outputFormat: "Review question set by risk area" },
};
const WARNING = "Do not paste classified, CUI, proprietary or personally identifiable information into a tool that is not authorized for it. Review all output before use.";

export const prompts: Prompt[] = list.map((p) => ({ ...p, ...META[p.slug], warnings: META[p.slug]?.warnings ?? WARNING, updatedAt: "2026-10-11" }));
