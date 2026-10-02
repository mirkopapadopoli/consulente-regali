# Protezioni della spesa

Apify costa ~$0,075 per ricerca completa; l'AI ~$0,0004. Le difese limitano Apify.

| # | Difesa | Dove | Valore | Come si cambia |
|---|---|---|---|---|
| 1 | Turnstile (token monouso) | `guard/turnstile.ts` | — | widget nel pannello Turnstile; `TURNSTILE_SITE_KEY` (var) e `TURNSTILE_SECRET` (segreto) |
| 2 | Limite di velocità per IP | `guard/velocita.ts` | 3 ricerche / 60 s | `ratelimits` in `wrangler.jsonc` (richiede deploy) |
| 3 | Quota per visitatore | `guard/quota.ts` | 5 ricerche complete / giorno | var `QUOTA_VISITATORE` |
| 4 | Cache richieste e ricerche | `store/cache.ts` | 24 h | costante `TTL_CACHE_MS` |
| 5 | Filtro AI "è un regalo?" | `ai/capire.ts` | — | prompt `PROMPT_CAPIRE` |
| 6 | Tetto giornaliero globale | `guard/quota.ts` | 150 ricerche complete / giorno | var `TETTO_GIORNALIERO` |

Ordine: il limite di velocità viene prima di Turnstile (una raffica viene respinta senza chiamare siteverify); quota e tetto girano solo subito prima di Apify, così le risposte dalla cache non consumano quota.

Oltre quota o tetto la ricerca continua in **modalità leggera** (idee + "Cerca su Amazon", nessuna chiamata Apify).

Le var si cambiano da Cloudflare → Workers → consulente-regali → Settings → Variables, senza deploy di codice.

## Tetti esterni (ultima garanzia)

- Apify: Console → Settings → Usage limits → limite mensile (valore iniziale $30).
- OpenRouter: chiave dedicata al progetto → limite di credito (valore iniziale $5).

## Avviso

All'80% del tetto giornaliero il Worker invia un messaggio Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). Ogni blocco o passaggio in leggera è registrato nella tabella `eventi` (`tipo = 'blocco'`, colonna `difesa`).

## Nota sullo sviluppo locale

In locale tutte le richieste arrivano dallo stesso IP: dopo 3 ricerche in un minuto compare "Hai fatto molte ricerche di fila". È il comportamento previsto.
