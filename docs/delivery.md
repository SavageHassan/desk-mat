# DeskKart — build status (26 Nov 2026)

Store: **DeskKart** (`vt2ha9-q6.myshopify.com`) · Preview theme: **Deskmat Preview** `#189864050870` (unpublished)
Live Horizon theme untouched; original backed up in `backup-original-theme/`.

## Built

**Brand system** — forest `#27463A`, clay `#A85528`, butter `#EFC87C` on cream `#FAF5EC`, ink `#14120E`.
Archivo display / Inter body, 4px radii, hairline rules. Logo mark (inline SVG in CSS) + wordmark in the header.

**Imagery** — one cohesive campaign: the same charcoal felt mat on light-wood desks across seven JPEGs
(`dk-hero, dk-product, dk-top, dk-lifestyle, dk-detail, dk-context, dk-alt`). All JPEG, no PNG/SVG media.

**Homepage** (`templates/index.json`), eleven sections:
hero (full-bleed, scrim, editorial type) → marquee → intro (asymmetric 12-col editorial) → trust bar →
buy block (live Shopify product, qty stepper, AJAX add to cart, Buy it now) → six benefits on a green band →
lookbook (horizontal snap carousel) → brand statement → specification table → FAQ → closing CTA.

**Product page** — Horizon's native gallery/variant/qty/ATC/Buy-now, restyled, with specification, lifestyle
split, FAQ and CTA appended; recommendations removed (single-product store).

**Pages** — About and FAQ written and published. Contact page exists (store default).

**Motion** (`assets/dk-motion.js`) — IntersectionObserver reveals with stagger, hover zooms, marquee,
toast animation. Honours `prefers-reduced-motion` and falls back to visible-by-default.

**Cart** (`assets/dk-cart.js`) — AJAX `/cart/add.js`, live cart badge, confirmation toast with a cart link,
falls back to a normal form post. Verified: add → cart → Shopify checkout handoff.

## Needs confirming before launch (do not guess)
- Real price (currently **Rs 1,800 placeholder**)
- Size, material, finish, base, care — all showing `—` in the specification table
- Real product photography (current images are licensed Unsplash stock, not the actual product)
- Product title and description (description is marked placeholder)
- Store contact details, social links
- Shipping policy, refund policy, privacy policy, terms (none created in Shopify)

## Remaining Shopify admin steps
1. **Product media** — the product carries 3 earlier off-brand images (`desk-mat-1/2/3.jpg`) plus the 4
   on-brand ones (`deskkart-01..04.jpg`). Shopify's media grid cannot be scripted to delete media; remove the
   three in admin, or approve deleting and recreating the product.
2. **Navigation** — add About (`/pages/about`) and FAQ (`/pages/faq`) to the main menu. The menu editor's
   confirm control could not be driven by script.
3. **Duplicate Contact page** — a second, hidden "Contact" page was created; delete it and keep the original.
4. **Store setup** — choose a plan, activate payments, configure shipping rates and taxes, create policies,
   remove the storefront password. None of these are done, and the store cannot sell until they are.

## Revamp — 26 Nov 2026 (Allbirds-inspired)
- **Palette** taken from allbirds.com: page oat `#ECE9E2`, white cards, light band `#F5F4F1`,
  deep band `#E0DACF`, dark panel `#212121`, pure-black square buttons (radius 0), sale `#B4471F`.
- **Custom header** (`dk-header`): sticky, rotating announcement bar, logo mark + wordmark, underline nav,
  inline search, account, cart with live count, mobile slide-in drawer with search.
- **Custom footer** (`dk-footer`): brand blurb, Shop/Help link columns, newsletter, bottom bar.
- **Custom collection page** (`dk-collection` + `templates/collection.json`): image banner, product count,
  sort pills, 4-up card grid.
- **Custom page template** (`dk-page` + `templates/page.json`): styled editorial pages, and a designed
  two-column contact layout (info panel + form) for the contact page.
- **Hero slideshow** (`dk-slideshow`): 3 auto-rotating slides, arrows, dots, swipe, pause on hover/focus/hidden tab.
- **Promo banners**, **type cards**, **two product rows**.

### QA performed
Scripted contrast + font-size audit run on home, collection and product pages.
Fixed: brand section white-on-light text; benefits band dark/light conflict; legacy `#header-group` rules
forcing 12px white text on the new header; muted grey raised from 4.44:1 to AA; 10px kicker/badge text;
mobile announcement clipping. Remaining audit hits are white-on-gradient false positives.

### Note on Vercel
This repository is a **Shopify theme** (Liquid templates), not a static site or Node app, so Vercel has
nothing to build or serve and returns 404. Liquid can only be rendered by Shopify. Use the Shopify preview
theme, or publish the theme, to view the store.
