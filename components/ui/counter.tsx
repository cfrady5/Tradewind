"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatMetric } from "@/lib/format";

/**
 * Counts up to the real value once on entering the viewport.
 * The final value is always rendered for SSR / no-JS / reduced motion, and the
 * accessible label always carries the exact figure — animation never misrepresents data.
 */
export function Counter({ value, format }: { value: number; format: "number" | "currency-compact" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const fmt = (n: number) => formatMetric(n, format);
  const [display, setDisplay] = useState(fmt(value));

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(fmt(format === "number" ? Math.round(v) : v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref}>
      <span className="sr-only">{fmt(value)}</span>
      <span aria-hidden="true" className="tabular-nums">{display}</span>
    </span>
  );
}
