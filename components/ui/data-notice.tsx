import { Info } from "./icons";
import type { DataSource } from "@/lib/data/types";

/** Shown wherever content is not coming from the approved CMS dataset. */
export function DataNotice({ source, what = "this list", className = "" }: { source: DataSource; what?: string; className?: string }) {
  if (source === "supabase") return null;
  return (
    <div role="note" className={`flex items-start gap-3 rounded-md border border-dashed border-runway/70 bg-runway-tint/50 px-4 py-3 text-sm text-navy ${className}`}>
      <Info width={18} height={18} className="mt-0.5 shrink-0 text-[#8a4100]" />
      <p>
        <strong className="font-semibold">Development data.</strong>{" "}
        {what.charAt(0).toUpperCase() + what.slice(1)} is shown from illustrative fixtures until the approved Supabase dataset is connected. Entries marked <em>Sample</em> are not real program records.
      </p>
    </div>
  );
}
