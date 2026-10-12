import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/cn";
import { signOut } from "@/lib/portal/actions";
import { PORTAL_NAV, STATUS_LABEL, type Field, type Status } from "@/lib/portal/registry";
import { fieldValue } from "@/lib/portal/registry";
import { atLeast, type PortalProfile } from "@/lib/portal/roles";
import type { PortalSession } from "@/lib/supabase/server";
import { Btn, BtnLink, inputClass } from "./primitives";

export { Btn, BtnLink, inputClass };

export type Params = Record<string, string | string[] | undefined>;
export const one = (p: Params, k: string) => (Array.isArray(p[k]) ? p[k]?.[0] : p[k]) ?? "";

export const fmtDate = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "America/New_York" }) : "—");
export const fmtDateTime = (v: unknown) => (v ? new Date(String(v)).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }) : "—");
export const fmtBytes = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

/* ---------------------------------------------------------------- shell */
export function PortalShell({ session, title, actions, children, current }: { session: PortalSession & { profile: PortalProfile }; title: string; actions?: ReactNode; children: ReactNode; current?: string }) {
  const { profile } = session;
  return (
    <div className="min-h-dvh bg-cloud text-navy lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="on-dark flex flex-col bg-navy-900 text-white lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/employee/dashboard" aria-label="Portal dashboard"><BrandLogo variant="wordmark-reversed" decorative className="w-[140px]" /></Link>
          <span className="rounded-sm bg-white/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-sky">Portal</span>
        </div>
        <nav aria-label="Portal" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {PORTAL_NAV.filter((n) => !n.min || atLeast(profile.role, n.min)).map((n) => {
              const active = current ? current === n.href : false;
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("flex h-9 items-center rounded-sm px-3 text-sm transition-colors", active ? "bg-white/12 font-semibold text-white" : "text-white/75 hover:bg-white/8 hover:text-white")}>
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate font-semibold">{profile.display_name || profile.email}</p>
          <p className="truncate text-xs text-white/60">{profile.email}</p>
          <div className="mt-3 flex items-center justify-between">
            <RoleBadge role={profile.role} />
            <form action={signOut}><button type="submit" className="text-xs font-semibold text-sky hover:text-white">Sign out</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/95 px-5 backdrop-blur lg:px-8">
          <h1 className="truncate text-lg font-bold">{title}</h1>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        <main id="main" className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

/** Centered card used by sign-in, MFA and other pre-portal screens (brief §12: minimal dark screen). */
export function AuthScreen({ title, lead, children, footer }: { title: string; lead?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="on-dark relative flex min-h-dvh flex-col items-center justify-center bg-navy-900 px-4 py-12 text-white">
      <div className="absolute inset-0 bg-grid-fine opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" aria-label="Tradewinds home"><BrandLogo variant="wordmark-reversed" decorative className="w-[170px]" /></Link>
          <span className="eyebrow text-sky">Employee portal</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-white p-8 text-navy shadow-lift">
          <h1 className="text-2xl font-bold">{title}</h1>
          {lead && <div className="mt-2 text-sm text-ink-muted">{lead}</div>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-xs text-white/60">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- feedback */
const NOTICES: Record<string, string> = {
  saved: "Saved.", pending: "Your changes were saved as pending changes and sent to an admin for approval.", approved: "Pending changes approved and published.",
  rejected: "Pending changes rejected.", restored: "Version restored.", invited: "Invitation sent.", updated: "Account updated.", uploaded: "File uploaded.",
  deleted: "File deleted.", signedout: "You are signed out.", timeout: "You were signed out after 30 minutes of inactivity.", denied: "Your role does not include that area.",
  reset: "Check your email for a reset link.",
};
export function Notice({ params }: { params: Params }) {
  const error = one(params, "error");
  const key = Object.keys(NOTICES).find((k) => one(params, k));
  const status = one(params, "status");
  const archived = one(params, "archived");
  const text = one(params, "notice") || (key ? (key === "invited" ? `Invitation sent to ${one(params, "invited")}.` : NOTICES[key]) : "") || (status ? `Status set to ${STATUS_LABEL[status as Status] ?? status}.` : "") || (archived ? `${archived} record(s) archived.` : "");
  if (!error && !text) return null;
  return (
    <div role={error ? "alert" : "status"} className={cn("mb-6 rounded-md border px-4 py-3 text-sm", error ? "border-[#f3b4b4] bg-[#fff2f2] text-[#8a1c1c]" : "border-[#b8e2c8] bg-[#eefaf2] text-[#14532d]")}>
      {error || text}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    draft: "bg-cloud text-navy ring-navy/15", in_review: "bg-runway-tint text-[#8a4100] ring-runway/40", scheduled: "bg-sky-tint text-cobalt ring-cobalt/20",
    published: "bg-[#e6f6ec] text-[#14532d] ring-[#14532d]/20", archived: "bg-[#eeeeee] text-ink-muted ring-ink-muted/20",
  };
  return <span className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] ring-1", tone[status] ?? tone.draft)}>{STATUS_LABEL[status as Status] ?? status}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  return <span className="rounded-sm bg-sky-tint px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cobalt">{role.replace("_", " ")}</span>;
}

/* ---------------------------------------------------------------- primitives */
export function Card({ title, children, className, actions }: { title?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-lg border border-line bg-white", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          {title && <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-ink-muted">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Label({ children, htmlFor, help }: { children: ReactNode; htmlFor?: string; help?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
      {children}
      {help && <span className="ml-2 font-normal normal-case tracking-normal text-ink-muted/80">{help}</span>}
    </label>
  );
}

/** One editor input, rendered from a registry field. */
export function FieldInput({ field, value, readOnly }: { field: Field; value: unknown; readOnly?: boolean }) {
  const id = `f-${field.name}`;
  const v = fieldValue(field, value);
  const common = { id, name: field.name, disabled: readOnly, required: field.required && field.type !== "boolean" };
  let control: ReactNode;
  switch (field.type) {
    case "textarea": case "list": case "json":
      control = <textarea {...common} defaultValue={v} rows={field.type === "json" ? 6 : field.wide ? 6 : 3} className={cn(inputClass, field.type === "json" && "font-mono text-xs")} />; break;
    case "select":
      control = (
        <select {...common} defaultValue={v} className={inputClass}>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o === "" ? "—" : o}</option>)}
        </select>
      ); break;
    case "boolean":
      control = <input type="checkbox" id={id} name={field.name} defaultChecked={Boolean(value)} disabled={readOnly} className="size-4 accent-cobalt" />; break;
    case "number": control = <input {...common} type="number" step="any" defaultValue={v} className={inputClass} />; break;
    case "date": control = <input {...common} type="date" defaultValue={v} className={inputClass} />; break;
    case "datetime": control = <input {...common} type="datetime-local" defaultValue={v} className={inputClass} />; break;
    case "url": control = <input {...common} type="url" defaultValue={v} className={inputClass} />; break;
    case "email": control = <input {...common} type="email" defaultValue={v} className={inputClass} />; break;
    case "tags": control = <input {...common} type="text" defaultValue={v} placeholder={field.options ? field.options.join(", ") : "Comma separated"} className={inputClass} />; break;
    default: control = <input {...common} type="text" defaultValue={v} className={inputClass} />;
  }
  return (
    <div className={cn(field.wide && "md:col-span-2", field.type === "boolean" && "flex items-center gap-2 pt-5")}>
      {field.type === "boolean" ? (
        <>{control}<label htmlFor={id} className="text-sm font-medium">{field.label}</label></>
      ) : (
        <>
          <Label htmlFor={id} help={field.help}>{field.label}{field.required && <span className="text-runway"> *</span>}{field.restricted && <span className="ml-2 rounded-sm bg-runway-tint px-1.5 py-0.5 text-[0.6rem] text-[#8a4100]">Gov-only</span>}</Label>
          <div className="mt-1">{control}</div>
        </>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">{children}</p>;
}

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="bg-cloud text-left text-[0.7rem] uppercase tracking-[0.1em] text-ink-muted"><tr>{head}</tr></thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
export const th = "px-4 py-2.5 font-semibold";
export const td = "px-4 py-2.5 align-top";
