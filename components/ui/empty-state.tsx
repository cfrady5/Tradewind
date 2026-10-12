import type { ReactNode } from "react";
import { Search } from "./icons";

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-cloud/40 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-sm bg-white text-cobalt shadow-card">
        <Search />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      {children && <div className="mt-2 max-w-md text-ink-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
