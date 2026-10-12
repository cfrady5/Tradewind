import { MonogramField } from "@/components/brand/monogram-field";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="on-dark relative isolate flex min-h-[80svh] items-center overflow-hidden bg-hero text-white">
      <MonogramField variant="cta" className="absolute inset-0 -z-10 h-full w-full" />
      <div className="container-page pt-[var(--header-h)]">
        <h1 className="max-w-2xl text-h1 font-bold">Page not found.</h1>
        <p className="mt-6 max-w-xl text-lead text-white/75">The requested page may have moved. Use the destinations below.</p>
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
