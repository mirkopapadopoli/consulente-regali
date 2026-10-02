# Operazioni

## Segreti (`wrangler secret put <NOME>`)

`APIFY_TOKEN`, `OPENROUTER_API_KEY` (chiave dedicata al progetto), `TURNSTILE_SECRET`, `VISITOR_SALT`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
In locale: `.dev.vars` (copia di `.dev.vars.example`, ignorato da git).

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run db:migrate:local` | crea le tabelle D1 in locale (una volta, prima di `npm run dev`) |
| `npm run dev` | pagina + Worker in locale (Vite) |
| `npm test` | test nel runtime Workers (nessun servizio a pagamento) |
| `npm run typecheck` | controllo tipi |
| `npm run deploy` | build + `wrangler deploy` (solo su richiesta di Mirko) |
| `npx wrangler d1 migrations apply consulente-regali --remote` | applica le migrazioni in produzione |

Senza le migrazioni locali la pagina funziona lo stesso ma senza cache, quote e link condivisibili (nel log: `no such table`).

## Primo deploy

Vedi il piano `docs/superpowers/plans/2026-10-02-consulente-regali-mvp.md`, Task 14.

## Timeout AI

`AI_TIMEOUT_MS` (default 6000) vale per ciascuna chiamata OpenRouter. Se scade durante "scegli", le card compaiono comunque ma senza il perché (scelta di riserva). Nei test reali del 2026-10-02 è successo almeno una volta: se capita spesso, alzarlo a 9000–10000 dal pannello.

## Se arriva l'avviso dell'80%

1. Guardare gli ultimi eventi: `npx wrangler d1 execute consulente-regali --remote --command "SELECT difesa, dettaglio, COUNT(*) FROM eventi WHERE quando > datetime('now','-1 day') GROUP BY 1,2"`.
2. Molti `ricerca` da pochi visitatori → abbassare `QUOTA_VISITATORE`.
3. Traffico legittimo in crescita → alzare `TETTO_GIORNALIERO` e il limite Apify insieme.
4. Sospetto abuso → abbassare `TETTO_GIORNALIERO` a 0: tutti in modalità leggera, costo quasi zero.

## Pulizia automatica

Cron giornaliero alle 03:00 UTC (`wrangler.jsonc` → `triggers`): cancella eventi > 90 giorni, cache scadute, contatori > 7 giorni.
