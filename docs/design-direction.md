# Design direction — Desk Mat storefront

## What gimmi.pk does well (reference, not to be copied)
Poppins throughout, black pill-ish CTAs on white, category-first navigation, dense product grids,
review wall for social proof, bundle/combo strip, four-icon trust bar. Strong at merchandising,
weak at brand atmosphere — the cards, badges and gradients read "Shopify template".

## Our direction: warm, editorial, product-led
Single-product brand, so the storefront behaves like a product site, not a catalogue.

- **Palette** — paper `#FBF9F6`, ink `#16140F`, muted `#5C564C`, hairline `#E4DDD2`.
  Warm neutrals match desk-mat materials (felt, PU leather, cork) and avoid the stark-white template look.
- **Type** — Archivo (tight, confident grotesk) for headings at large display sizes with tight tracking;
  Inter 16px for body. No decorative fonts, no gradients.
- **Geometry** — 4px radii, hairline borders instead of shadow cards, generous but controlled spacing.
  Badges squared and uppercase.
- **Imagery** — full-bleed desk scenes; product shown in context (keyboard, mouse, lamp) rather than on white.
- **Motion** — subtle image zoom on card hover only.

## Status
Design tokens are applied in `theme/config/settings_data.json` and pushed to the preview theme.
Section/page build continues once real product content and imagery are available.
