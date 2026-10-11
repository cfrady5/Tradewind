import type { Tone } from "@/components/ui/badge";
import type { VehicleStatus } from "./types";

export const VEHICLE_STATUS: Record<VehicleStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "open" },
  limited: { label: "Limited availability", tone: "upcoming" },
  historical: { label: "Historical", tone: "closed" },
  "pending-confirmation": { label: "Status being confirmed", tone: "accent" },
};
