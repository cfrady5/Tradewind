import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Hero collage tile. Uses a photo from /public/images/hero/<name>.{webp,jpg,png} when present,
 * otherwise an on-brand illustrated fallback so the layout never shows a broken or empty slot.
 * Photos are interim until ARI-approved imagery is supplied (see docs/05-STATUS.md).
 */
export type TileName = "jet" | "satellite" | "network" | "ship";

const ALT: Record<TileName, string> = {
  jet: "Aircraft flying above the clouds at sunset",
  satellite: "Satellite orbiting Earth",
  network: "Abstract data network",
  ship: "Naval ship at sea at sunset",
};

function findPhoto(name: TileName) {
  for (const ext of ["webp", "jpg", "png"]) {
    if (existsSync(join(process.cwd(), "public/images/hero", `${name}.${ext}`))) return `/images/hero/${name}.${ext}`;
  }
  return null;
}

export function HeroTile({ name, className, sizes, priority }: { name: TileName; className?: string; sizes: string; priority?: boolean }) {
  const photo = name === "network" ? null : findPhoto(name);
  return (
    <div className={cn("relative overflow-hidden rounded-[18px] bg-navy shadow-[0_24px_60px_-20px_rgb(2_44_73/0.45)] ring-1 ring-white/60", className)}>
      {photo ? (
        <Image src={photo} alt={ALT[name]} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <Fallback name={name} />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/10" aria-hidden />
    </div>
  );
}

/** Abstract, brand-palette scenes — intentional art, not placeholders. */
function Fallback({ name }: { name: TileName }) {
  if (name === "jet")
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={ALT.jet}>
        <defs>
          <linearGradient id="t-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a5fa8" /><stop offset=".55" stopColor="#7FBDF2" /><stop offset=".72" stopColor="#fbd3a6" /><stop offset="1" stopColor="#F9943B" /></linearGradient>
          <radialGradient id="t-sun" cx=".72" cy=".74" r=".35"><stop offset="0" stopColor="#fff4e0" /><stop offset="1" stopColor="#fff4e0" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#t-sky)" />
        <rect width="400" height="300" fill="url(#t-sun)" />
        {[230, 248, 266, 282].map((y, i) => <path key={y} d={`M0 ${y} Q100 ${y - 14} 200 ${y} T400 ${y} V300 H0Z`} fill="#022C49" opacity={0.12 + i * 0.1} />)}
        <g transform="translate(150 118) rotate(-8)" fill="#022C49">
          <path d="M0 0 L120 -6 L132 0 L120 6 Z" />
          <path d="M52 -2 L18 -42 L34 -42 L80 -3 Z" /><path d="M52 2 L18 42 L34 42 L80 3 Z" />
          <path d="M108 -3 L98 -18 L106 -18 L120 -3 Z" /><path d="M108 3 L98 18 L106 18 L120 3 Z" />
        </g>
      </svg>
    );
  if (name === "satellite")
    return (
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={ALT.satellite}>
        <defs><radialGradient id="t-earth" cx=".5" cy="1.35" r="1"><stop offset=".55" stopColor="#004AAD" /><stop offset=".62" stopColor="#7FBDF2" stopOpacity=".7" /><stop offset=".66" stopColor="#011c2f" stopOpacity="0" /></radialGradient></defs>
        <rect width="300" height="400" fill="#011c2f" />
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 97) % 300} cy={(i * 53) % 260} r={i % 7 === 0 ? 1.4 : 0.7} fill="#fff" opacity={0.3 + ((i * 13) % 7) / 10} />)}
        <rect width="300" height="400" fill="url(#t-earth)" />
        {Array.from({ length: 24 }, (_, i) => <circle key={`c${i}`} cx={40 + ((i * 41) % 220)} cy={330 + ((i * 17) % 60)} r="1.2" fill="#F9943B" opacity=".8" />)}
        <g transform="translate(150 150) rotate(-28)">
          <rect x="-95" y="-14" width="70" height="28" fill="#164a70" stroke="#7FBDF2" strokeWidth="1" />
          <rect x="25" y="-14" width="70" height="28" fill="#164a70" stroke="#7FBDF2" strokeWidth="1" />
          {[-80, -62, -44, 40, 58, 76].map((x) => <line key={x} x1={x} x2={x} y1="-14" y2="14" stroke="#7FBDF2" strokeOpacity=".5" />)}
          <line x1="-25" x2="25" y1="0" y2="0" stroke="#A9BED0" strokeWidth="2" />
          <rect x="-14" y="-18" width="28" height="36" rx="3" fill="#c9d6e2" />
          <circle cx="0" cy="-26" r="7" fill="none" stroke="#c9d6e2" strokeWidth="2" />
        </g>
      </svg>
    );
  if (name === "ship")
    return (
      <svg viewBox="0 0 500 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={ALT.ship}>
        <defs>
          <linearGradient id="t-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#164a70" /><stop offset=".5" stopColor="#7FBDF2" /><stop offset=".62" stopColor="#fbd3a6" /><stop offset=".64" stopColor="#022C49" /><stop offset="1" stopColor="#011c2f" /></linearGradient>
          <radialGradient id="t-sun2" cx=".82" cy=".6" r=".3"><stop offset="0" stopColor="#ffe2b8" /><stop offset="1" stopColor="#ffe2b8" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="500" height="300" fill="url(#t-dusk)" />
        <rect width="500" height="300" fill="url(#t-sun2)" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${200 + i * 11} Q125 ${194 + i * 11} 250 ${200 + i * 11} T500 ${200 + i * 11}`} stroke="#7FBDF2" strokeOpacity={0.25 - i * 0.02} fill="none" />)}
        <path d="M380 192 L460 196 Q470 196 476 186 L330 186 Z" fill="#F9943B" opacity=".35" />
        <g fill="#011c2f">
          <path d="M90 200 L370 200 L400 182 L60 182 Z" />
          <path d="M150 182 L150 160 L260 160 L270 182 Z" />
          <path d="M185 160 L185 132 L230 132 L235 160 Z" />
          <rect x="205" y="96" width="4" height="36" /><rect x="192" y="106" width="30" height="3" />
          <path d="M300 182 L305 170 L340 170 L345 182 Z" /><rect x="320" y="162" width="28" height="2" />
        </g>
      </svg>
    );
  return (
    <svg viewBox="0 0 240 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={ALT.network}>
      <rect width="240" height="400" fill="#011c2f" />
      {Array.from({ length: 14 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
          const x = c * 26 + (r % 2) * 13;
          const y = 40 + r * 26 + Math.sin(c * 0.7 + r * 0.45) * 18;
          return <circle key={`${r}-${c}`} cx={x} cy={y} r={1.2 + ((r + c) % 3) * 0.5} fill={(r * c) % 11 === 0 ? "#F9943B" : "#7FBDF2"} opacity={0.35 + ((r + c) % 5) * 0.13} />;
        }),
      )}
      {Array.from({ length: 14 }, (_, r) => (
        <path key={r} d={Array.from({ length: 10 }, (_, c) => `${c ? "L" : "M"}${c * 26 + (r % 2) * 13} ${40 + r * 26 + Math.sin(c * 0.7 + r * 0.45) * 18}`).join(" ")} stroke="#337DE5" strokeOpacity=".35" fill="none" />
      ))}
    </svg>
  );
}
