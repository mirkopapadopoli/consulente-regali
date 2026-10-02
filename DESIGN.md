---
name: cosaregalo
description: Tre regali su misura, in pochi secondi — a gift finder dressed in The Verge's 2024 editorial system (dark canvas, hazard accents, color-block tiles).
source: docs/context/theverge-DESIGN.md (template from getdesign "theverge", adapted)
colors:
  nero: "#000000"
  tela: "#131313"
  ardesia: "#2d2d2d"
  cornice: "#313131"
  bianco: "#ffffff"
  tenue: "#e9e9e9"
  grigio: "#949494"
  menta: "#3cffd0"
  viola: "#5200ff"
  viola-binario: "#3d00bf"
  viola-chiaro: "#a68cff"
  giallo: "#ffd23f"
  blu-link: "#3860be"
  fuoco: "#1eaedb"
typography:
  display:
    fontFamily: "Anton, Impact, Helvetica Neue, sans-serif"
    usage: "wordmark and section titles only, never below ~38px"
    hero: "clamp(56px, 16vw, 168px) / 0.92"
    section: "clamp(38px, 9.6vw, 80px) / 0.95"
  ui:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Arial, sans-serif"
    body: "400 16px/1.6"
    headline: "700 clamp(26px, 6.4vw, 34px)/1.05"
    whisper: "300 17–19px, 1.9px tracking, UPPERCASE"
  mono:
    fontFamily: "JetBrains Mono, Courier New, monospace"
    usage: "UPPERCASE only: labels, buttons, timestamps, tags"
    label: "600 11–12px, 1.5px tracking"
  serif:
    fontFamily: "Newsreader, Georgia, serif"
    usage: "print-voice moments: the 'perché' on each card, step and invite copy"
    body: "400 17–21px/1.3"
radius:
  input: 2px
  image: 16px
  tile: 20px
  card: 24px
  pill: 24px
  outlinePill: 40px
  dot: 50%
spacing:
  base: 8px
  container: 1280px
  column: 760px
  breakpoints: [600px, 760px, 900px]
motion:
  easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  colorTransition: 150–180ms
  entrance: "emergi: 10px rise + fade, 500–650ms, staggered 120–140ms"
  liveDot: "1s pulse"
  ticker: "38s linear marquee"
  reducedMotion: "all animation off"
---

# cosaregalo — design system

Adapted from The Verge's 2024 system (template in `docs/context/theverge-DESIGN.md`). Proprietary faces are replaced by open fonts self-hosted in `public/fonts/` (~100 KB total): Manuka → **Anton**, PolySans → **Hanken Grotesk**, PolySans Mono → **JetBrains Mono**, FK Roman → **Newsreader**. Tokens live in `:root` of `src/web/stile.css`.

## 1. Atmosphere

Near-black editorial canvas, loud and paced. Acid mint and ultraviolet act as hazard accents; gifts arrive as saturated color-block tiles. Everything is centered on one axis and works from 390px phones (inside Instagram) to wide desktops. No light mode, no gradients, no drop shadows: elevation is color or a 1px rule.

## 2. Color roles

- **tela `#131313`** — canvas for every view; also the sticky bar background (solid, never translucent).
- **menta `#3cffd0`** — primary action (pill buttons, nav CTA), live state (pulsing dot, "IN CORSO"), link underline, selection, ticker band, first color tile.
- **viola `#5200ff`** — second color tile, "Fino a"/"Ama" pills, timeline rail (`#3d00bf`), notice/error border, closing invite block.
- **giallo `#ffd23f`** — third color tile and pill.
- **ardesia `#2d2d2d`** — secondary pills (examples, share actions), Instagram notice.
- **bianco / tenue / grigio** — primary text / muted text / metadata and fine print. `grigio` on `tela` ≈ 6.3:1.
- **blu-link `#3860be`** — hover color of plain links. **fuoco `#1eaedb`** — keyboard focus ring only.
- **nero `#000000`** — text on menta/giallo tiles and pills (the template's Absolute Black); white text on viola.

## 3. Typography

- **Anton** is the shout: the giant wordmark `cosaregalo?` (with the `?` in menta), section titles ("Come funziona", "Per ogni occasione", "Non sai ancora cosa regalare?"), step numerals 01–03, the bar wordmark. Never for UI or body.
- **Hanken Grotesk** is the workhorse: headline under the wordmark (one line on desktop), card titles, prices (700, tabular), body and fine print. The 300-weight UPPERCASE "whisper" sits above the wordmark.
- **JetBrains Mono** is always UPPERCASE with 1.1–1.5px tracking: field label, "HO CAPITO", pill labels, "RICERCA 01", "SCELTA 01", buttons, footer meta.
- **Newsreader** carries the print voice: the "perché" on each gift card is the reading moment of the page.

## 4. Components

- **Sticky bar** (`Testata.tsx`): wordmark left (on the home it fades in only after the giant wordmark scrolls away), mono section links center (≥760px), menta pill "TROVA UN REGALO" right that scrolls to and focuses the field.
- **Hero**: whisper → giant `cosaregalo?` → headline "Tre regali su misura, in pochi secondi." → mono field label → textarea (2px radius, grey border, menta border + violet inner ring on focus) → menta pill "PREPARA I REGALI" → example pills.
- **Ticker band** (`Vetrina.tsx`): full-bleed menta strip, mono recipients separated by ✦, 38s marquee.
- **Come funziona**: three color-block tiles (menta/viola/giallo), Anton numerals, Hanken title, serif text.
- **Per ogni occasione**: six outlined 20px tiles with a menta arrow; click pre-fills the field ("Regalo di Natale per ") and focuses it.
- **Invite**: violet 24px block with Anton question and a white pill.
- **Ho capito**: colored pills (field name in mono + value in Hanken 700), plus "PREZZI DEL … · ORE …" when results are in.
- **Timeline** (`Preparazioni`): 1px violet rail, mono "RICERCA 0N", white-bordered 20px cards with the pulsing menta dot and "IN CORSO". Light-mode ideas reuse it as "IDEA 0N" with an outlined menta pill "CERCA SU AMAZON".
- **Gift tiles** (`Card.tsx`): 24px color blocks cycling menta → viola → giallo; header "SCELTA 0N" + discount pill; product image on a white 16px well (4:3, contain); serif "perché"; clamped Amazon title; price + list price; drawn star + rating; black (white on viola) pill "VEDI SU AMAZON"; underlined "Aggiungi al carrello".
- **Actions**: slate pills Condividi / Mandalo a te / Altre idee (icons hidden on phones).
- **Notice**: 1px violet border, 20px radius, light-violet icon.
- **Footer**: hairline, affiliate disclosure (bold) + data note, hairline, mono links left and "© 2026 COSAREGALO · UN PROGETTO DI MIRKO PAPADOPOLI" right.

## 5. Layout

Container 1280px with 20px (phone) / 32px (tablet) / 48px (desktop) side padding; reading column 760px; all content centered. Gift tiles: 1 column on phones, 2 on tablets (third centered), 3 on desktop. Section rhythm 56–96px.

## 6. Depth

Flat. Hierarchy comes from color blocks and 1px rules (`cornice`, white, menta, violet). No box shadows except the textarea's inner focus ring.

## 7. Rules

- Dark canvas everywhere; no gradients, no glows, no drop shadows.
- Mono is UPPERCASE only; Anton is display only.
- Menta and viola are hazard accents and tile fills, never background washes.
- Rounded everything except the textarea (2px).
- The affiliate disclosure stays visible in the footer of every page.
- Icons are drawn SVG (`Icona.tsx`), never emoji; ✦ in the ticker is typographic ornament.
- Reduced motion turns every animation off.
