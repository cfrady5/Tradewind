import type { EventItem, Resource } from "../types";

export const resources: Resource[] = [
  // Verified documents (URLs found during audit)
  { slug: "im-awardable-now-what", title: "I'm Awardable — Now What?", kind: "guide", audiences: ["industry"],
    summary: "Next steps after your solution is determined awardable: approved language, the Awardable graphic and engaging buyers.",
    url: "https://storage.tradewindai.com/pdfs/Info-Sheet-Im-Awardable-Now-What.pdf" },
  { slug: "customer-handbook", title: "Solutions Marketplace Customer Handbook (v1.2)", kind: "document", audiences: ["government"],
    summary: "How government customers access the Marketplace, discover solutions and proceed to award.", date: "2023-08-30",
    url: "https://storage.tradewindai.com/pdfs/Tradewinds-Solutions-Marketplace-Customer-Handbook-v1.2-Aug-2023_2023-08-30-143746_tawp.pdf" },
  // Illustrative
  { slug: "sample-how-to-submit", sample: true, title: "How to submit your pitch video", kind: "video", audiences: ["industry"], duration: "6:12", hasCaptions: true, hasTranscript: true,
    summary: "A walkthrough of account creation, upload and submission." },
  { slug: "sample-buyer-search", sample: true, title: "Finding solutions as a government buyer", kind: "video", audiences: ["government"], duration: "4:48", hasCaptions: true,
    summary: "Searching the Marketplace and shortlisting awardable solutions." },
  { slug: "sample-exemplar-computer-vision", sample: true, title: "Exemplar pitch: computer vision", kind: "exemplar", audiences: ["industry"], duration: "4:55", hasCaptions: true,
    summary: "A clear problem-to-evidence structure within five minutes." },
  { slug: "sample-exemplar-data-platform", sample: true, title: "Exemplar pitch: data platform", kind: "exemplar", audiences: ["industry"], duration: "4:31",
    summary: "Demonstrates differentiation and deployment evidence." },
  { slug: "sample-writing-problem-statements", sample: true, title: "Writing outcome-based problem statements", kind: "tutorial", audiences: ["government"],
    summary: "Frame needs so the Marketplace returns relevant solutions." },
  { slug: "sample-acquisition-guide", sample: true, title: "Tradewinds Acquisition Guide", kind: "guide", audiences: ["government"], date: "2025-10-01",
    summary: "Contracting authorities and vehicles available to buyers. Link pending confirmation of the current version." },
  { slug: "sample-news-marketplace-update", sample: true, title: "Marketplace adds new search filters", kind: "news", audiences: ["all"], date: "2026-09-15",
    summary: "Government users can now filter by technology category and focus area." },
  { slug: "sample-news-collection-period", sample: true, title: "Reminder: October collection period closes Oct 31", kind: "news", audiences: ["industry"], date: "2026-10-01",
    summary: "Submit by 12:00 pm ET on the last day of the month." },
];

export const events: EventItem[] = [
  { slug: "sample-industry-office-hours", sample: true, title: "Industry Office Hours: Preparing Your Pitch", startsAt: "2026-10-22T18:00:00Z", endsAt: "2026-10-22T19:00:00Z",
    format: "virtual", location: "Online", summary: "Open Q&A with the Marketplace team for solution providers." },
  { slug: "sample-buyer-workshop", sample: true, title: "Government Buyer Workshop: From Discovery to Award", startsAt: "2026-11-05T15:00:00Z", endsAt: "2026-11-05T17:00:00Z",
    format: "hybrid", location: "Arlington, VA & online", summary: "Hands-on session for program and contracting teams." },
  { slug: "sample-summit-recap", sample: true, title: "Tradewinds Ecosystem Summit", startsAt: "2026-05-14T13:00:00Z",
    format: "in-person", location: "Washington, DC", summary: "Recap and session recordings from the spring summit." },
];
