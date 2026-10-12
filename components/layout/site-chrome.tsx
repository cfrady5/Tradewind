"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Public header/footer are hidden inside the employee portal, which has its own shell. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/employee")) return null;
  return <>{children}</>;
}
