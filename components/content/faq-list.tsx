import { AccordionItem } from "@/components/ui/accordion";
import type { Faq } from "@/lib/data/types";

/** Reusable FAQ block — every question is individually linkable via #slug. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="border-t border-line">
      {faqs.map((f) => (
        <AccordionItem key={f.slug} id={f.slug} title={f.question}>
          {f.answer.split("\n\n").map((p) => <p key={p}>{p}</p>)}
          <p className="!mt-4 text-xs"><a href={`/marketplace/faqs#${f.slug}`}>Link to this answer</a></p>
        </AccordionItem>
      ))}
    </div>
  );
}
