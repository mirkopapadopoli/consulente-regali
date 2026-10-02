# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** people who don't know what to give someone (Christmas, birthdays, Secret Santa, anniversaries) and want a few concrete, credible ideas fast. Many arrive from Instagram on a phone, often inside Instagram's in-app browser.
- **Equally important:** people planning calmly on a computer, for example a Christmas list for the whole family, running several searches in one sitting.

## Product Purpose

cosaregalo (`cosaregalo.mirkopapadopoli.com`) turns one sentence ("mia mamma, ama il giardinaggio, 40 €") into 3 real Amazon.it products, each with photo, price, discount when real, rating and a personal reason why it fits that person. Success: the visitor finds a gift they trust and clicks through to Amazon; the result can be shared with whoever is buying with them.

## Positioning

It starts from the person, not the product: no catalogue to browse, no deal hunting. The value is the curated choice and the reason behind it, picked from live Amazon results within the stated budget.

## Operating Context

- One page: free-text box → "Ho capito: …" chips within ~3 s → 3 skeleton cards naming the searches → product cards in ~10–15 s.
- Light mode (ideas with "Cerca su Amazon", no prices) when quotas, daily cap or data source say so; it must look intentional, never broken.
- Shared result page `/r/<id>` with prices frozen at search time and their date.
- Instagram in-app browser: banner suggesting "Apri nel browser" (iOS), Android buttons open the Amazon app.
- Turnstile verification runs invisibly unless Cloudflare needs an interaction.

## Capabilities and Constraints

- Stack: Vite + Preact page served by a Cloudflare Worker (Hono); no CSS framework; must stay light on mobile.
- Every Amazon link carries the affiliate tag; built only in `src/shared/affiliate.ts`.
- Product images come from Amazon search results (variable framing, white backgrounds, any aspect ratio).
- Product titles from Amazon are long and keyword-stuffed.
- No accounts, no login, no cookie banner (one technical cookie).
- Copy is Italian.

## Brand Commitments

- Name: **cosaregalo** (lowercase in the logo today).
- Voice: elegant consultant, personal-shopper register; addresses the visitor with "tu", measured and polished, never shouty or salesy.
- Footer credits the maker: a project made by Mirko Papadopoli.
- Affiliate disclosure "In qualità di Affiliato Amazon ricevo un guadagno dagli acquisti idonei" must stay clearly visible (Amazon + AGCM), not only in fine print.

## Evidence on Hand

- Real outputs from production runs (product cards, reasons) — see screenshots in the redesign session.
- No testimonials, user counts, press or reviews exist. Do not invent any.

## Product Principles

1. The reason matters more than the product: every card must make the "why" easy to read.
2. Trust before click: prices, ratings and disclosure are honest and visible; discounts only when real.
3. Waiting is part of the experience: the 10–15 s search must feel alive, never stalled.
4. Every state is designed: light mode, few results, errors and blocks look intentional.
5. Fast on a phone inside Instagram, comfortable on a desktop planning session.

## Accessibility & Inclusion

No specific requirement stated; target WCAG 2.2 AA contrast and full keyboard use as the default floor.
