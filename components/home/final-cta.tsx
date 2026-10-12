import { MonogramField } from "@/components/brand/monogram-field";
import { ButtonLink } from "@/components/ui/button";
import { EXTERNAL } from "@/lib/site-config";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="on-dark relative isolate overflow-hidden bg-hero text-white">
      <MonogramField variant="cta" className="absolute inset-0 -z-10 h-full w-full" />
      <div className="container-page section-y">
        <Reveal className="max-w-3xl">
          <h2 id="cta-title" className="text-display font-extrabold">
            Innovation moves <span className="text-gradient-sky">faster here</span><span className="text-runway">.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href={EXTERNAL.marketplaceSignIn} external variant="accent" size="lg">Access Marketplace</ButtonLink>
          <ButtonLink href="/marketplace/providers" variant="secondary-dark" size="lg" arrow={false}>Submit a Solution</ButtonLink>
          <ButtonLink href="/contact" variant="secondary-dark" size="lg" arrow={false}>Contact</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
