import type { ReactNode } from "react";

/**
 * Brand signature from the guidelines: headlines end in a Runway Orange period
 * ("MISSION & VISION."). Applies only to string titles that end with a period.
 */
export function DotTitle({ children }: { children: ReactNode }) {
  if (typeof children !== "string" || !children.endsWith(".")) return <>{children}</>;
  return (
    <>
      {children.slice(0, -1)}
      <span className="text-runway">.</span>
    </>
  );
}
