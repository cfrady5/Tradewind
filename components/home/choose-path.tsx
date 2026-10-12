import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

/** Pathway strip (brief §6.1, §11): government buyers, solution providers, acquisition professionals. */
const PATHS = [
  { role: "Government buyers", body: "Search evaluated solutions, view awardable vendors and request acquisition support.", href: "/marketplace/government" },
  { role: "Solution providers", body: "Submit a five-minute pitch, get assessed and become discoverable to government users.", href: "/marketplace/providers" },
  { role: "Acquisition professionals", body: "Use guides, contract vehicles and AI tools to move faster with confidence.", href: "/contract-vehicles" },
];

export function ChoosePath() {
  return (
    <section id="paths" aria-labelledby="paths-title" className="border-b border-line bg-white">
      <h2 id="paths-title" className="sr-only">Choose your path</h2>
      <ul className="container-page grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {PATHS.map((p, i) => (
          <Reveal as="li" key={p.href} delay={i * 0.06} className="md:px-8 md:first:pl-0 md:last:pr-0">
            <Link href={p.href} className="group relative flex h-full flex-col py-10">
              <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-runway transition-transform duration-(--duration-enter) ease-(--ease-out) group-hover:scale-x-100" aria-hidden />
              <h3 className="text-xl font-bold transition-colors group-hover:text-cobalt">{p.role}</h3>
              <p className="mt-2 text-ink-muted">{p.body}</p>
              <ArrowRight className="mt-auto pt-5 text-cobalt transition-transform duration-(--duration-ui) group-hover:translate-x-1.5" width={40} height={40} />
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
