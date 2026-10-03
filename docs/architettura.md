# Architettura

Un solo Cloudflare Worker (`src/worker/index.ts`, Hono) serve l'API e la pagina statica costruita da Vite (`src/web/`).

## Flusso di una ricerca (`POST /api/cerca`, risposta SSE)

1. `guard.checkAccesso` — limite di velocità per IP, poi Turnstile (`src/worker/guard/`).
2. Cache richieste — stesso testo normalizzato nelle ultime 24 h → risultato salvato (`store/cache.ts`).
3. `ai/capire.ts` — OpenRouter estrae destinatario, interessi, budget, 3 ricerche e titolo; `regalo=false` ferma tutto.
4. `guard.checkSpesa` — quota visitatore e tetto giornaliero, solo se almeno una ricerca non è in cache.
5. `products/apify.ts` — 3 ricerche Apify in parallelo, cache 24 h per ricerca.
6. `products/filtri.ts` — budget, voto ≥ `MIN_STELLE`, recensioni ≥ `MIN_RECENSIONI`, prezzi assurdi, duplicati.
7. `ai/scegli.ts` — 3 prodotti + perché; scelta di riserva (voto × recensioni, senza perché) se l'AI sbaglia, va in timeout o fallisce in qualsiasi modo. Il perché è chiesto in parole (`MAX_PAROLE` = 18, ~110 caratteri) perché il modello rispetta male i limiti in caratteri: con "massimo 140 caratteri" metà delle frasi in produzione usciva troncata. `tronca()` (tetto 200) è solo una rete di sicurezza e, quando può, chiude all'ultima frase completa invece di mettere `…` (2026-10-03).
8. `store/risultati.ts` — salvataggio con id breve → pagina `/r/<id>`.

Orchestrazione: `src/worker/flusso.ts`. Eventi SSE: `capito`, `non_capito`, `risultati` (completa/leggera), `salvato`, `bloccato`, `errore` (`src/shared/types.ts`).

Tempi misurati in locale (2026-10-02): etichette "Ho capito" ~3 s, card ~11 s per una ricerca nuova, ~2 s se la richiesta è in cache.

## Moduli e confini

| Modulo | Responsabilità |
|---|---|
| `src/shared/affiliate.ts` | unico punto che costruisce URL Amazon |
| `src/shared/testo.ts` | pulizia testo, normalizzazione, hash, giorno Europe/Rome |
| `src/worker/products/` | `ProductSource` (Apify oggi, Creators API domani) e filtri |
| `src/worker/ai/` | client OpenRouter e i due passi AI |
| `src/worker/guard/` | le difese di spesa |
| `src/worker/store/` | D1 |
| `src/web/` | pagina Preact |

## Cambiare fonte prodotti

Aggiungere una classe che implementa `ProductSource` e farla passare la suite `test/helpers/contratto-product-source.ts`; poi sostituirla in `src/worker/index.ts`.

Spec completa: `docs/superpowers/specs/2026-10-02-consulente-regali-design.md`.
