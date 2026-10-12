import type { AiTool } from "../types";

/**
 * The AI Playground catalog as listed in the rebuild brief. Names are real tools on the
 * current site; descriptions, access details and authorization levels are PENDING program-office
 * content (status "pending") and are editable in the Employee Portal. Nothing here is invented.
 */
const t = (slug: string, name: string, category: string): AiTool => ({
  slug, name, category,
  summary: "Details pending program-office content.",
  description: "This tool is listed in the Tradewinds AI Playground. Its description, intended audience, data-sensitivity guidance and access requirements will be published here once approved.",
  useCases: [],
  availability: "pending",
  access: "Access requirements pending",
  dataSensitivity: "Do not use with CUI, classified or export-controlled data unless the tool is explicitly authorized for it.",
});

export const tools: AiTool[] = [
  t("acqbot", "AcqBot", "Acquisition Assistant"),
  t("foci-api", "FOCI API", "Risk & Compliance"),
  t("genai-mil", "GenAI.mil", "Generative AI"),
  t("procuresight", "ProcureSight", "Market Research"),
  t("ai-acquisition-assistant", "AI Acquisition Assistant", "Acquisition Assistant"),
  t("psc-predictor", "PSC Predictor", "Classification"),
  t("aia-toolkit", "AIA Toolkit", "AI Assurance"),
  t("turboinnovate", "TurboInnovate", "Innovation"),
  t("psf-intelligence", "PSF Intelligence", "Market Research"),
];
