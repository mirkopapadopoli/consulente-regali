# Brief — Consulente Regali

**Data:** 2026-10-02
**Origine:** brainstorming nella sessione Claude Code del repo `BotTelegram`
**Stato:** decisioni di direzione prese; spec in `docs/superpowers/specs/2026-10-02-consulente-regali-design.md` (le voci "Da decidere" qui sotto sono risolte lì)

## Cosa costruiamo

Una **webapp "consulente regali" con AI**: l'utente scrive per chi è il regalo e quanto vuole spendere
(es. *"mia mamma, ama il giardinaggio, 40 €"*) e riceve **3 proposte motivate** con link Amazon affiliato
(tag `mirkopapadopo-21`).

Proposta di valore: *"Dimmi per chi è e quanto vuoi spendere: ti dico cosa regalare."*
Il valore è **la scelta curata e il perché**, non i dati di prezzo.

## Perché questo prodotto (ragionamento del 2026-10-02)

- Il collo di bottiglia non è la tecnologia ma la **distribuzione**. Commissioni Amazon basse (1–6%):
  servono migliaia di visite/mese per guadagni rilevanti. La SEO su un dominio nuovo non rende prima del 2027.
- **Canale di distribuzione = Instagram di Mirko (@mirkopapadopoli), in chiave "maker / build in public".**
  Mirko NON vuole usare il profilo per spingere offerte. Lo usa per mostrare cose che ha costruito con l'AI
  (siti, bot, tool) e, di conseguenza, portare utenti al prodotto.
- Quindi il criterio di scelta di ogni prodotto è:
  1. **Demo forte** — mostrabile in un reel di 30–60 s (input → output → "wow")
  2. **Utilità reale** — chi lo prova ci torna anche senza il reel
  3. **Affiliazione naturale** — il link affiliato è il modello di business dentro l'utilità, non il messaggio
  4. **Fattibile senza Creators API**
- Anche il **processo di costruzione è contenuto** ("giorno 1: …").

### Alternative valutate

| Idea | Esito |
|---|---|
| **A. Consulente regali web** | ✅ **scelta** — demo immediata, picco Natale (~8 settimane), non bloccata dall'API, link condivisibile da reel/bio |
| B. "Sconto vero?" (incolli link → verdetto sconto reale/finto) | rimandata — serve storico prezzi; possibile capitolo 2 |
| C. Stesso consulente ma come bot Telegram | scartata come prodotto principale — meno condivisibile di un link web; il bot esistente può servire dopo come canale di ritorno |

## Decisioni prese

- **Repo separato** da `BotTelegram` (questo). Prodotto diverso, deploy diverso (web serverless, non VPS),
  storia git pulita da mostrare. Nessuna dipendenza runtime dal bot; eventuale aggancio futuro solo via link `t.me/...`.
- **Si costruisce subito, senza Creators API.** Catalogo curato a mano. Quando l'account Associates fa le
  **10 vendite qualificate in 30 giorni** si sblocca la Creators API e si passa a quella (prezzi, immagini, ecc.).
- **Vincoli di policy Amazon: per ora non bloccanti** (scelta di Mirko). La ricerca esistente è in
  `~/Code/offertealvolo/.wayfinder/` e `~/Code/affarialvolo/.scratch/` se servirà riprenderla.
- La bozza del 2026-10-01 (`bozza-2026-10-01.md`) è **materiale di partenza, non la spec**. Era pensata
  per SEO + backend FastAPI dentro BotTelegram: va ri-centrata su demo, condivisione e build in public,
  e l'architettura (API sul VPS, Cloudflare Tunnel, tabelle `gift_*` nel DB del bot) è superata dalla
  scelta del repo autonomo.

## Da decidere nella spec

- Stack e hosting (es. Next.js su Vercel / Cloudflare Pages / Netlify)
- Formato del catalogo (file nel repo vs DB) e come lo si alimenta
- Provider AI (nel bot si usa OpenRouter) e limiti di spesa
- Esperienza del consulente: input libero vs guidato, pagina risultato condivisibile
- Nome/brand e dominio
- Misurazione (click verso Amazon)
- Primo reel: cosa si mostra
