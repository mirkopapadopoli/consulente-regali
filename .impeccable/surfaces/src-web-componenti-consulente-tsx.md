---
version: 1
slug: "src-web-componenti-consulente-tsx"
primary_target: "src/web/componenti/Consulente.tsx"
related_targets: ["src/web/componenti/PaginaCondivisa.tsx","src/web/componenti/Card.tsx","src/web/componenti/Idee.tsx","src/web/stile.css"]
---

# Surface brief — pagina consulente (/) e risultato condiviso (/r/<id>)

Scope: the single gift-advisor page (home → ricerca → risultati, modalità leggera, messaggi) plus the shared result page. Visitor mode: Operate.

Audience/job: people who don't know what to give; many on a phone inside Instagram, many planning calmly on desktop. Task: write one sentence, read 3 curated gifts with their reason, open Amazon. Constraints: Italian copy, affiliate disclosure visible, light mode must look intentional, fast inside the Instagram in-app browser.

Success (confirmed): immediate trust, an enjoyable 10–15 s wait, cards that make you click, a recognisable identity. Must not feel: generic-AI (purple gradients, glow), e-commerce (banners, shouty badges, countdowns).

Memorable moment: the label filling in line by line while the three preparations are made.

Unresolved: none blocking; logo mark beyond the wordmark is open.

## Direction contract

THESIS: Each gift is a bespoke preparation. The consultant fills in a label for one person and prepares three remedies to "cosa le regalo?". Refuses the category default of a search box over a rounded product grid with an orange buy button.

OWN-WORLD: Historic Italian officina-profumo labels. Cool porcelain ground #f3f5f4, bottle-green #173d30 for the shell and headings, ink #14171a for text, amber #b06a1f reserved for the single active state (search running, primary action), a thin gilt rule #a8893a used only as the label's inner border. One-pixel double rules, zero radius, small caps for field names, roman numerals I–III for the preparations. Product photos sit in white "vials" (square wells with a hairline frame).

STORY: The visitor recognises a curated service, not a shop; writes for whom, what they love, how much; watches the label being filled in ("Per · Ama · Fino a") and three preparations named; reads each reason first, then price and rating; opens Amazon or shares the label.

FIRST VIEWPORT: Phone 390px. Top: wordmark "cosaregalo" in small caps over a double rule. Centre, ~60% of the viewport: one large label, framed by double rule + gilt inner rule; its body is the textarea with field hints "Per chi · Cosa ama · Fino a quanto" and the primary button "Prepara i regali" in amber at the label's foot. Below: three example labels as small tappable tags. Desktop: label centred at max 720px, examples in one row, results in three columns.

FORM: Officina — position 7 of my ordered grounded list (1 vetrina di bottega, 2 bigliettino del regalo, 3 cancelleria di lusso, 4 segnaletica modernista milanese, 5 cartolina postale, 6 carta da pacchi dei grandi magazzini, 7 etichette da officina farmaceutica storica). Seed key f4c2af3a. Raises: amber reserved for the active state (orienteering); one-pixel printed state marks, zero radius (centre-rail); hierarchy by scale contrast (type specimen); coherent rule system for modules, denser on desktop (high-density).

SIGNATURE MOVE: during the search the label's fields are written in one by one ("Per: mamma", "Ama: giardinaggio", "Fino a: 40 €") and the three preparations appear as numbered rows "I · set attrezzi giardinaggio — in preparazione" that turn into product cards when ready. Motion: a single typewriter-like reveal per field and a fade-up per card; reduced-motion shows the final state.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
