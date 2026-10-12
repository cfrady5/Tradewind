import { DotTitle } from "@/components/brand/dot-title";
import { Clock, Shield, Users } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";

const PILLARS = [
  { icon: Clock, title: "Velocity", body: "Start from solutions that already passed a competitive assessment." },
  { icon: Shield, title: "Compliance", body: "A documented process with stated criteria behind every awardable solution." },
  { icon: Users, title: "Access", body: "One front door between government users and the vendors who can help." },
];

/** Why the platform exists (brief §11): velocity, compliance, access. */
export function Why() {
  return (
    <section aria-labelledby="why-title" className="bg-cloud">
      <div className="container-page section-y">
        <Reveal>
          <h2 id="why-title" className="max-w-3xl text-h2 font-bold"><DotTitle>{"A faster path from mission need to awardable capability."}</DotTitle></h2>
        </Reveal>
        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.08} className="group">
              <span className="grid size-12 place-items-center rounded-md bg-white text-cobalt shadow-card transition-colors duration-(--duration-ui) group-hover:bg-cobalt group-hover:text-white"><p.icon width={24} height={24} /></span>
              <h3 className="mt-5 text-h3 font-bold">{p.title}</h3>
              <p className="mt-2 text-ink-muted">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
