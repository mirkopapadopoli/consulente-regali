---
name: cosaregalo
description: Tre regali su misura, scelti per una persona — a gift consultant dressed as a historic Italian officina label.
colors:
  porcellana: "#f3f5f4"
  carta: "#ffffff"
  verde: "#173d30"
  verde-medio: "#2c5a49"
  verde-tenue: "#dfe7e3"
  inchiostro: "#14171a"
  inchiostro-2: "#46564f"
  segnaposto: "#6a7a73"
  ambra: "#9c5714"
  ambra-scura: "#7f4610"
  ambra-tenue: "#f4e6d6"
  oro: "#a8893a"
  filetto: "#c9d3ce"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(30px, 8.4vw, 52px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 72"
  headline:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "clamp(26px, 6vw, 38px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 72"
  wordmark:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "26px"
    fontWeight: 600
    letterSpacing: "0.02em"
    fontVariation: "\"opsz\" 28"
  title:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.25
    fontVariation: "\"opsz\" 28"
  reason:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.35
    fontVariation: "\"opsz\" 20"
  entry:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.4
    fontVariation: "\"opsz\" 20"
  numeral:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1
    fontVariation: "\"opsz\" 24"
  price:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\", \"lnum\""
    fontVariation: "\"opsz\" 24"
  label:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.1em"
    fontFeature: "\"smcp\", \"c2sc\""
  body:
    fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.02em"
  fine:
    fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0px"
spacing:
  passo: "8px"
  passo-1-5: "12px"
  passo-2: "16px"
  passo-2-5: "20px"
  passo-3: "24px"
  passo-4: "32px"
  passo-5: "40px"
  passo-6: "48px"
  passo-7: "56px"
  passo-8: "64px"
components:
  button-attivo:
    backgroundColor: "{colors.ambra}"
    textColor: "{colors.carta}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-attivo-hover:
    backgroundColor: "{colors.ambra-scura}"
    textColor: "{colors.carta}"
  button-attivo-disabled:
    backgroundColor: "{colors.verde-tenue}"
    textColor: "{colors.inchiostro-2}"
  button-pieno:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.porcellana}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-pieno-hover:
    backgroundColor: "{colors.verde-medio}"
    textColor: "{colors.porcellana}"
  button-filetto:
    backgroundColor: "transparent"
    textColor: "{colors.verde}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-filetto-hover:
    backgroundColor: "{colors.verde-tenue}"
    textColor: "{colors.verde}"
  cartellino:
    backgroundColor: "{colors.carta}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.none}"
    padding: "9px 14px"
  cartellino-hover:
    backgroundColor: "{colors.carta}"
    textColor: "{colors.verde}"
  etichetta:
    backgroundColor: "{colors.carta}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.none}"
    padding: "5px"
    width: "720px"
  etichetta-campo-input:
    backgroundColor: "transparent"
    textColor: "{colors.inchiostro}"
    typography: "{typography.entry}"
    rounded: "{rounded.none}"
    padding: "10px 0 12px"
  rimedio:
    backgroundColor: "{colors.carta}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.none}"
    padding: "16px"
  fiala:
    backgroundColor: "{colors.carta}"
    rounded: "{rounded.none}"
    padding: "8px"
    width: "104px"
  messaggio:
    backgroundColor: "{colors.ambra-tenue}"
    textColor: "{colors.inchiostro}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  sconto:
    backgroundColor: "transparent"
    textColor: "{colors.verde}"
    rounded: "{rounded.none}"
    padding: "1px 6px"
---

# Design System: cosaregalo

## Overview

**Creative North Star: "L'Officina"**

The page is a printed label from a historic Italian officina profumo-farmaceutica, filled in by hand for one person. The consultant writes the label ("Per · Ama · Fino a") and prepares three remedies, numbered I, II, III, each set in its own framed module with the product resting in a white vial. Everything is printed matter: cool porcelain ground, bottle-green ink for the shell and headings, near-black ink for reading text, hairline rules doubled where a printer would double them, and not one rounded corner.

Hierarchy comes from scale contrast inside a single serif, Bodoni Moda, set large for the label title and the reasons and tiny in small caps for field names and state marks; a plain system sans carries buttons, Amazon titles and fine print so the serif stays ceremonial. Colour is disciplined: green is structure, ink is reading, amber marks whatever is live (the primary action, the running search, focus, a notice), and a thin gilt thread is ornament. Density rises on desktop (three columns of remedies) without changing the vocabulary.

Motion is the preparation itself: label fields are written in left to right one after another, preparation rows rise into place, a single amber hairline "doses" under the running state, and remedy cards fade up in sequence. Under reduced motion every animation and transition is removed and the final state shows at once.

**Key Characteristics:**
- Porcelain ground, white paper modules, bottle-green frames, zero radius everywhere.
- One serif (Bodoni Moda, self-hosted, optical size axis used) in many sizes; system sans for utility text.
- Small caps for field names and state marks; roman numerals I–III for the preparations.
- Rules, not fills, carry structure: 1px hairlines, 3px double rules for mastheads and section feet, a gilt inner rule only inside the large label.
- Amber is scarce and always means "live".

## Colors

A cool, near-monochrome green-on-porcelain system with one warm signal colour and one metallic ornament.

### Primary
- **Bottle Green** (verde): the shell. Wordmark, label title, field values, prices, frames of the label and remedy cards, double rules of masthead and footer, the filled "Vedi su Amazon" button, link colour, text selection background.
- **Pressed Green** (verde-medio): hover of the filled green button, the "pronto" state mark, the discount box border, scrollbar thumb.
- **Wash Green** (verde-tenue): quiet fills and secondary rules — hover of outline buttons, disabled primary, divider between label fields, the double rule under a remedy's head, the vial's outer ring.

### Secondary
- **Apothecary Amber** (ambra): the live signal. Primary action button ("Prepara i regali", "Prepara di nuovo", "Prepara un regalo per qualcun altro"), the "in preparazione" state mark and its dosing hairline, focus outline, text caret, focused input underline, the rules and icon of a notice band.
- **Burnt Amber** (ambra-scura): hover of the amber button only.
- **Amber Wash** (ambra-tenue): background of the notice band (`messaggio`) for validation, errors and blocks.

### Tertiary
- **Gilt Thread** (oro): ornament only. The inner rule of the large label, the middle-dot separators in the field guide, the roman numerals, the rating star. Gilt sits at about 3.3:1 on paper, so it never carries new text that must be read on its own.

### Neutral
- **Cool Porcelain** (porcellana): page ground; also the text colour on the filled green button and on selection.
- **Label Paper** (carta): the label, remedy cards, vials, example tags, Instagram notice.
- **Ink** (inchiostro): reading text — the textarea entry, reasons, ratings, the affiliate disclosure.
- **Faded Ink** (inchiostro-2): small caps labels, Amazon product titles, list price, review counts, notes, footer text.
- **Placeholder Ink** (segnaposto): textarea placeholder only (4.5:1 on paper).
- **Hairline** (filetto): neutral 1px rules — example tags at rest, vial frame, row dividers in preparation and idea lists, Instagram notice border.

### Named Rules
**The Live Amber Rule.** Amber appears only on what is active right now or demands attention: the one primary action, the running search, focus, and notices. Anything that is merely clickable is green.

**The Green Exit Rule.** The click out to Amazon is a filled green button, never amber; the amber action belongs to the consultant ("Prepara"), not the shop.

**The Gilt Is Thread Rule.** Gilt is a thin line, a dot or a numeral. It is never a fill, a button, or body text.

## Typography

**Display Font:** Bodoni Moda (self-hosted variable woff2, weights 400–700, `font-display: swap`, preloaded), with Didot, Bodoni 72, serif fallbacks.
**Body Font:** system UI sans (ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial).

**Character:** A high-contrast Didone used like a pharmacy label printer would — huge for the name of the preparation, tiny small caps for the field names — against an invisible system sans that handles buttons and Amazon's noisy titles without competing.

### Hierarchy
- **Display** (500, clamp(30px, 8.4vw, 52px), 1.04, opsz 72, balanced wrap): the home label title "Tre regali su misura, scelti per una persona." Only one per page.
- **Headline** (500, clamp(26px, 6vw, 38px)): the title of a filled-in label on the shared page.
- **Wordmark** (600, 26px; 32px from 760px): "cosaregalo", lowercase, green, in the masthead.
- **Title** (500, 22px, 1.25): field values on the filled label ("mamma", "giardinaggio", "40 €").
- **Reason** (400, 19px, 1.35, pretty wrap): the "perché" of each remedy, the first thing read on a card; 16px in the idea list. Idea names use 400 21px.
- **Entry** (400, 20px, 1.4; 17px in the compact label): what the visitor types in the label.
- **Numeral / Price** (500 / 600, 20px, lining tabular figures for prices): I–III and euro amounts.
- **Label** (500, 13px, all-small-caps, 0.1em; 600 14px from 760px): field names, the field guide, the masthead motto, the examples heading, state marks ("in preparazione", "pronto").
- **Body** (400, 16px, 1.5): default text, notes (14px), Instagram notice (14px).
- **Button** (600, 15px, 1, 0.02em): all buttons; 13px in the mobile action row.
- **Fine** (400, 13px, 1.4): Amazon product titles (clamped to 2 lines), footer, ratings. Footer paragraphs cap at 70ch.

### Named Rules
**The One Serif Rule.** Everything with voice is Bodoni Moda at a different size or in small caps; never introduce a second display face.

**The Small Caps Are Field Names Rule.** Small caps label a field or print a state; they do not sit above a headline as an eyebrow.

## Layout

Single column page, max 1120px, side gutter 16px on phones and 32px from 760px. All rhythm is multiples of an 8px step (`passo`): 16/24/32/48 between blocks, 56px above the footer. The label, examples, preparations, notices, footer and the wide action button share one 720px reading column, centred; examples widen to 900px on desktop and sit in a single centred row.

Breakpoint at 760px only. Below it, remedy cards stack, each with a 104px vial beside the text; above it they sit in three equal columns (two if there are two, one centred 420px card if there is one), the vial goes full width at 4:3 above the text, idea rows put their "Cerca su Amazon" button inline, and the action row ("Condividi", "Mandalo a te", "Altre idee") becomes centred auto-width buttons with icons. On phones the action row is a three-column grid with icons hidden.

The home and working states use the same label: on home it is the large framed form; once a search starts it collapses to a compact, unframed entry line, and the filled label appears below it.

## Elevation & Depth

Flat printed matter. Depth comes from paper-on-porcelain contrast and rules, not shadows. The one exception is the large home label, which lifts off the ground with a soft two-layer green-tinted shadow so it reads as a physical label laid on the counter.

### Shadow Vocabulary
- **Label lift** (`box-shadow: 0 1px 2px rgba(23, 61, 48, 0.08), 0 12px 32px -18px rgba(23, 61, 48, 0.35)`): the home label only; removed in the compact state.

### Named Rules
**The One Lift Rule.** Only the label casts a shadow. Cards, tags and buttons are flat; their edge is a rule.

## Shapes

Zero radius on every surface and control, inputs included (`border-radius: 0` is set explicitly to beat platform defaults). Form is built from rules: 1px green frames for modules, 1px hairlines for neutral dividers, 3px double rules (two printed hairlines) for the masthead foot, the footer head and a remedy's head, and on the large label a 5px paper margin, a green inner frame, and a gilt rule inset 5px inside it. Vials are square wells (4:3 on desktop) with a hairline frame and a wash-green ring 3px outside. Icons are hand-drawn on a 20px grid, 1.5px stroke, square caps, mitred joins, one weight across the page.

## Components

### Buttons
Printed marks, square and confident; one height (48px, 44px in the mobile action row, 40px for the text action).
- **Shape:** square corners (0px), 1px border slot, icon 18px trailing or leading at a 10px gap.
- **Attivo (amber):** the consultant's primary action. Full width in the label on phones, auto width min 240px on desktop. White text on amber.
- **Pieno (green):** the exit to Amazon on each remedy card, porcelain text on bottle green.
- **Filetto (outline):** secondary actions — share, send to yourself, more ideas, "Cerca su Amazon" on idea rows. Green text, green 1px border, transparent.
- **Hover:** 180ms colour transitions on the exit easing; amber darkens to burnt amber, green to pressed green, outline gains a wash-green fill.
- **Focus:** global 2px amber outline, 3px offset.
- **Disabled:** wash-green fill, faded ink text, default cursor.
- **Text action:** "Aggiungi al carrello" is an underlined serif link with a 16px icon, not a button.

### Chips (cartellini)
- **Style:** example prompts as small paper tags: white, 1px hairline border, serif 15px ink text, left aligned, 0 radius.
- **State:** hover turns border and text green. Tapping fills the label and starts the search.

### Cards / Containers (rimedi)
- **Corner Style:** square (0px).
- **Background:** label paper, 1px bottle-green frame.
- **Shadow Strategy:** none (see The One Lift Rule).
- **Head:** roman numeral in gilt left, "pronto" small-caps state mark in pressed green right, over a wash-green double rule.
- **Body:** vial + text (reason first, then the clamped Amazon title, then price, real discount, rating with gilt star and review count). Discount appears only at 5% or more and only with a real list price: struck list price plus a bordered "−N%" box.
- **Internal Padding:** 16px; actions stacked at the foot with 8px gap.

### Inputs / Fields
- **Style:** the textarea is the label's writing line: transparent, no box, 1px green underline, serif 20px entry, no resize.
- **Focus:** underline becomes 2px amber (padding compensates so nothing shifts); caret is amber.
- **Error:** a too-short entry refocuses the field and shows a notice band below the label.

### Navigation
- **Masthead:** wordmark left, small-caps motto "consulenza per regali" right on the same baseline, closed by a green double rule. No other navigation; the wordmark links home.
- **Footer:** opened by a green double rule; affiliate disclosure in bold ink first, then source note, then the maker's signature in serif green.

### L'Etichetta (signature)
The label in three states. **Home:** framed form with display title, gilt-dotted field guide "Per chi · Cosa ama · Fino a quanto", writing line and amber action. **Compact:** frame and shadow removed, entry at 17px, amber "Prepara di nuovo". **Filled:** a definition list of fields (96px small-caps name column, 22px green value), each field revealed left to right by a clip-path "write" (700ms, 260ms stagger); on the shared page it gains a headline and a "Prezzi del" date field.

### Preparazioni (signature)
While the search runs, a list under a green top rule shows one row per search: gilt numeral, serif name, and the amber "in preparazione" mark with a 1px amber hairline that grows and shrinks (1.6s, infinite). Rows rise in (600ms) after the label has had time to fill (900ms + 160ms stagger). When the result arrives the list is replaced by the remedy cards, which fade up with a 120ms stagger.

### Idee
Light-mode and fallback rows that share the preparation grammar: gilt numeral, idea name in serif green, optional 16px reason, outline "Cerca su Amazon". Introduced by a plain note so the state reads as intentional.

### Notice band (messaggio)
Full-column band, amber wash with amber top and bottom hairlines, amber warning icon, ink text, `role="status"`. Used for validation, rate limits, failed verification, errors and missing shared results.

## Do's and Don'ts

### Do:
- **Do** keep every corner at 0px, including native inputs.
- **Do** frame modules with 1px bottle-green rules and close mastheads and footers with a 3px double rule.
- **Do** reserve amber (#9c5714) for the single live action, running state, focus and notices; send people to Amazon with the filled green button.
- **Do** set field names and state marks in Bodoni Moda small caps (13px, 0.1em; 14px/600 on desktop).
- **Do** put the reason before the product title and price on every card.
- **Do** number preparations, cards and ideas with roman numerals I–III.
- **Do** place product photos in white vials with `object-fit: contain`, whatever Amazon's framing.
- **Do** build spacing from the 8px step and keep the reading column at 720px.
- **Do** strip all animation and transition under `prefers-reduced-motion` and show the final state.

### Don't:
- **Don't** round corners, add pill tags or coloured badges; states are printed small-caps marks.
- **Don't** add shadows beyond the home label's lift.
- **Don't** use amber for ordinary links, secondary buttons or decoration.
- **Don't** use gilt for fills, buttons or any new text that must be read on its own.
- **Don't** introduce a second display face or set long reading text in small caps.
- **Don't** place small-caps eyebrows or kickers above headlines.
- **Don't** use icon fonts or emoji; draw icons on the 20px grid at 1.5px stroke.
