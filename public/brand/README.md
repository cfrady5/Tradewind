# Approved brand assets

The files in this folder are **placeholders**. They are marked as placeholders on purpose:
the Tradewinds logo must never be recreated in text, CSS, or an approximation.

Replace each file with the approved artwork from the *Tradewinds Brand Guidelines (Sep 24, 2026)*,
keeping the **same filenames** — no code changes needed:

| File | Use |
|---|---|
| `tradewinds-wordmark-navy.svg` | Full wordmark on white / Cloud Gray surfaces |
| `tradewinds-wordmark-reversed.svg` | Full wordmark on Navy / dark surfaces |
| `tradewinds-monogram-blue.svg` | Monogram (blue treatment) — favicon, compact UI |
| `tradewinds-monogram-orange.svg` | Monogram (orange treatment) — emphasis moments on dark |

If the approved wordmark aspect ratio differs from 188×36, update the `w`/`h` values in
`components/brand/brand-logo.tsx` so layout space is reserved correctly (prevents CLS).
Also replace `app/icon.svg` with the approved monogram.
