import { DotTitle } from "@/components/brand/dot-title";
import { Clock, Shield, Users } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

const PILLARS = [
  {
    icon: Clock, title: "Velocity",
    body: "Buyers start from solutions that already passed a competitive, expert assessment, so they can move toward award without running a new competition from scratch.",
  },
  {
    icon: Shield, title: "Compliance",
    body: "Every awardable solution comes through a documented process with stated criteria, giving contracting offices a defensible basis to move toward award under the appropriate authority.",
  },
  {
    icon: Users, title: "Access",
    body: "Small businesses, non-traditional contractors and academia reach government users through one front door — and government users reach the field the same way.",
  },
];

/** Why the platform exists (brief §6.1, §11): velocity, compliance, access. */
export function Why() {
  return (
    <section aria-labelledby="why-title" className="relative overflow-hidden bg-cloud">
      <div className="absolute inset-0 bg-grid-light [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" aria-hidden />
      <div className="container-page relative section-y">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <h2 id="why-title" className="text-h2 font-bold"><DotTitle>{"A faster path from mission need to awardable capability."}</DotTitle></h2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={0.06}>
            <p className="text-lead text-ink-muted">Built for acquisition teams, vendors and mission owners who need to move.</p>
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.08} className="group relative bg-white p-8 transition-colors duration-(--duration-ui) hover:bg-sky-tint/30 lg:p-10">
              <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-runway transition-transform duration-(--duration-enter) ease-(--ease-out) group-hover:scale-x-100" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-md bg-sky-tint text-cobalt transition-colors duration-(--duration-ui) group-hover:bg-cobalt group-hover:text-white"><p.icon width={24} height={24} /></span>
                <span className="font-mono text-sm font-semibold text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-8 text-h3 font-bold">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
