import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

export type Step = { eyebrow: string; title: string; href: string; description?: string };

/** End-of-page module so no page is a dead end. */
export function NextSteps({ title = "Related", steps }: { title?: string; steps: Step[] }) {
  return (
    <section aria-labelledby="next-steps" className="border-t border-line bg-cloud">
      <div className="container-page py-16 md:py-20">
        <h2 id="next-steps" className="text-h3 font-bold">{title}</h2>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.href} delay={i * 0.06} className="bg-white">
              <Link href={s.href} className="group flex h-full flex-col p-7 transition-colors duration-(--duration-ui) hover:bg-sky-tint/40">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{s.eyebrow}</span>
                <span className="mt-3 text-xl font-semibold leading-snug">{s.title}</span>
                {s.description && <span className="mt-2 text-ink-muted">{s.description}</span>}
                <span className="mt-auto pt-6 text-cobalt">
                  <ArrowRight className="transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
