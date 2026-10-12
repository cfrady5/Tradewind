import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Document, Play } from "@/components/ui/icons";
import type { Resource } from "@/lib/data/types";
import { formatDate } from "@/lib/data/opportunity-status";

export const KIND_LABEL: Record<Resource["kind"], string> = {
  guide: "Guide", video: "Video", tutorial: "Tutorial", exemplar: "Exemplar", document: "Document", news: "News",
};

export function ResourceCard({ r }: { r: Resource }) {
  const isVideo = r.kind === "video" || r.kind === "exemplar";
  const Icon = isVideo ? Play : Document;
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-cobalt">
          <Icon width={18} height={18} /> {KIND_LABEL[r.kind]}
          {r.duration && <span className="font-medium text-ink-muted">· {r.duration}</span>}
        </span>
        {r.sample && <Badge tone="accent">Sample</Badge>}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug">{r.title}</h3>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">{r.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-xs font-medium text-ink-muted">
        {r.date && <span>{formatDate(r.date)}</span>}
        {r.hasCaptions && <span>Captions</span>}
        {r.hasTranscript && <span>Transcript</span>}
        <span className="ml-auto">{r.audiences.includes("all") ? "Everyone" : r.audiences.map((a) => (a === "government" ? "Government" : "Industry")).join(" · ")}</span>
      </div>
    </>
  );
  const cls = "group relative flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-[border-color,box-shadow,transform] duration-(--duration-ui) ease-(--ease-out)";
  if (!r.url) return <article className={cls}>{inner}<p className="mt-4 text-xs text-ink-muted">Link awaiting approved content.</p></article>;
  return (
    <article className={`${cls} hover:border-signal/50 hover:shadow-lift`}>
      {inner}
      <a href={r.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 rounded-lg" aria-label={`${r.title} (opens external site)`}>
        <ArrowUpRight className="absolute right-5 top-5 hidden" />
      </a>
    </article>
  );
}
