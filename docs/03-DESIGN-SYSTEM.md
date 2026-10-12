# 03 — Design System & Motion

Source of truth: `app/globals.css` (`@theme` tokens) and `components/ui/*`.
Brand authority: *Tradewinds Brand Guidelines (updated 09.24.26)*.

## Color

| Token | Hex | Role |
|---|---|---|
| `navy` | #022C49 | Anchor: dark sections, headings, navigation |
| `signal` | #337DE5 | Interactive accents, focus rings, data viz, large text |
| `cobalt` | #004AAD | Primary buttons, links on light surfaces |
| `sky` | #7FBDF2 | Links/accents on dark, diagrams, ambient light |
| `runway` | #F9943B | Strategic emphasis only: the single most important CTA on dark, active indicators, the headline period |
| `cloud` | #EEF1F3 | Alternating section surfaces |
| `white` | #FFFFFF | Primary content surface |

Derived neutrals (legibility only): `navy-900` #011C2F, `ink-muted` #4A5E6D, `ink-subtle` #A9BED0, `line` #D8E0E6.

### Verified accessible pairings (WCAG 2.2 AA)
| Pairing | Ratio | Allowed for |
|---|---|---|
| Navy on white / cloud | 14.4 / 12.7 | All text |
| ink-muted on white / cloud | 6.8 / 6.0 | Body text |
| Cobalt on white | 8.1 | Links, small text; white-on-cobalt buttons |
| Sky on navy | 7.2 | Links and labels on dark |
| ink-subtle on navy | 7.5 | Secondary text on dark |
| Navy on Runway Orange | 6.4 | Accent buttons |
| Orange on navy | 6.4 | Eyebrows / emphasis on dark |
| **Signal on white** | **4.0** | Large text (≥ 24px / 18.66px bold) and non-text UI only |
| **Signal on navy** | **3.6** | Non-text UI only |
| **Orange on white** | **2.2** | Decorative accents only — never text |

Every route is scanned by axe-core (WCAG 2.0/2.1/2.2 A+AA) in the test suite.

### Gradients
`bg-hero` (Navy-900 → Navy with a restrained Cobalt cast), Signal → Sky (data bars). Headline accents are solid Sky or Cobalt, never gradient text.

## Typography — Montserrat (self-hosted variable font)
| Token | Size | Weight | Use |
|---|---|---|---|
| `text-display` | clamp(44px → 88px) | 800 | Hero / final CTA |
| `text-h1` | clamp(36px → 64px) | 700 | Page titles |
| `text-h2` | clamp(32px → 56px) | 700 | Section headlines |
| `text-h3` | clamp(22px → 32px) | 700 | Component headlines |
| `text-lead` | clamp(17px → 21px) | 400 | Intro paragraphs |
| body | 16–18px | 400 | Copy |
| `eyebrow` | 12px, 0.16em, uppercase | 600 | Metadata and in-card labels only — sections and pages carry no kicker labels |

Signature: headlines that end in a period render it in Runway Orange (`components/brand/dot-title.tsx`), as in the guidelines.

## Layout
- `container-page`: max 1360px, fluid 20–48px gutters. 12-column grids at `lg`.
- `section-y`: fluid 72–144px vertical rhythm. Sections alternate **navy → white → cloud** for rhythm; never all-dark.
- Radii: 2 / 4 / 6 / 8 / 10px — squared geometry throughout; no pill buttons or badges. Elevation is hairline: `card` (1px rule), `lift` (rule + faint drop), `glow` (1px Sky ring on dark). No blurred orbs or gradient text.
- **Tone:** professional and mission-oriented. Headlines are declarative statements ("Rigorous assessment. Documented outcomes."), not slogans; no wordplay, em-dash asides or marketing superlatives.

## Graphic language
- **Official logo** (`components/brand/brand-logo.tsx`): full-color lockup on light, reversed on dark, monogram for compact/decorative use. Never redrawn.
- **Monogram field** (`components/brand/monogram-field.tsx`): the approved monogram (official PNG, never redrawn) set into a field of radial lines whose pulses travel slowly in toward its centre. Pure SVG/CSS; used on interior page headers, the final CTA and the 404.
- **Orbital journey** (`components/home/how-it-works.tsx`): four concentric rings ~15% populated with empty nodes, spinning in alternating directions — Assess highlights a few, Connect pulls them out to a holding orbit, Acquire draws three of them into the centre.
- **Monogram watermark** (footer) and **Cobalt/Signal band** echo the guideline stationery and page furniture.

## Components (`components/`)
Navigation (header + mega menu + mobile dialog), footer, breadcrumbs (with JSON-LD), `ButtonLink` (primary / accent / secondary / text), `Badge` (status tones), `SectionHeader`, `PageHero`, `NextSteps`, accordion (`<details>`), process steps (horizontal → vertical stepper), feature list, callouts, pending-content marker, data notice, empty state, search field, facet select, chip group, results bar, sort, pagination, opportunity / tool / resource cards, vehicle comparison table, prompt library, submission checklist, counters.

## Motion system
| Token | Value | Use |
|---|---|---|
| `--duration-micro` | 160ms | Hover color, chips |
| `--duration-ui` | 260ms | Buttons, menus, arrows, logo crossfade |
| `--duration-enter` | 520ms | Content entrances |
| `--duration-hero` | 900ms | Hero reveal |
| `--ease-out` | cubic-bezier(.22,1,.36,1) | Default — decisive, no bounce |

Patterns:
1. **Page load** — CSS-only staggered rise (`enter` utility, 90ms stagger) so it starts at first paint; CTAs arrive within ~0.5s and are interactive immediately. The homepage hero's pathway lines fade in behind the collage.
2. **Scroll reveals** — `Reveal` / `Stagger` (Motion `whileInView`, once, 18–24px rise).
3. **Scrollytelling** — How-it-Works pins its two-column block with GSAP ScrollTrigger and scrubs one master timeline (320vh) through four stages; the rings spin continuously on a clock (paused off-screen, off under reduced motion) while every selection attribute is a pure function of scroll progress, so reverse scrolling replays the selection exactly. Below 1024px, on short viewports, or under reduced motion the section is stage-based instead: steps in view select the stage and the visual tweens (or jumps) to that stage's resting state.
4. **Hover** — arrow nudges, underline draw (`link-underline`), border/elevation shifts, small `-translate-y-0.5` on cards; no tilt or large scale.
5. **Navigation** — header compresses 76→64px and turns solid on scroll; active-section underline uses a shared `layoutId`; mega menu content cross-slides between sections.
6. **Page transitions** — React `<ViewTransition>` crossfade (220ms) via the browser View Transitions API; no-op where unsupported.
7. **Data** — counters animate once from 0 to the exact value; the final value is server-rendered and exposed to assistive tech, so animation never misrepresents data.
8. **Reduced motion** — `prefers-reduced-motion: reduce` disables all decorative animation globally (CSS) and in Motion components (`useReducedMotion`); content renders in its final state immediately.
