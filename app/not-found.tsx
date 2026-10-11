import { Pathways } from "@/components/brand/pathways";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="on-dark relative isolate flex min-h-[80svh] items-center overflow-hidden bg-hero text-white">
      <Pathways variant="cta" className="absolute inset-0 -z-10 h-full w-full" />
      <div className="container-page pt-[var(--header-h)]">
        <h1 className="max-w-2xl text-h1 font-bold">This pathway doesn&rsquo;t lead anywhere.</h1>
        <p className="mt-6 max-w-xl text-lead text-white/75">The page may have moved in our redesign. These destinations will get you back on track.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="accent">Go home</ButtonLink>
          <ButtonLink href="/marketplace" variant="secondary-dark" arrow={false}>Marketplace</ButtonLink>
          <ButtonLink href="/opportunities" variant="secondary-dark" arrow={false}>Opportunities</ButtonLink>
          <ButtonLink href="/resources/faqs" variant="text-dark">FAQs</ButtonLink>
        </div>
      </div>
    </section>
  );
}
