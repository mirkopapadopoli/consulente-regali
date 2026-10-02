# Spec — Consulente Regali (MVP)

**Data:** 2026-10-02
**Stato:** approvata in brainstorming, in revisione scritta
**Contesto:** [`docs/context/brief.md`](../../context/brief.md) (perché questo prodotto). La bozza del 2026-10-01 è superata da questa spec.

## 1. Obiettivo

Webapp **`cosaregalo.<DOMINIO>`**: l'utente scrive in linguaggio naturale per chi è il regalo e quanto vuole spendere
(es. *"mia mamma, ama il giardinaggio, 40 €"*) e riceve **3 prodotti Amazon reali**, con foto, prezzo, eventuale sconto,
voto e una motivazione personale. Ogni pulsante verso Amazon è un link affiliato con tag `mirkopapadopo-21`.

Criteri di successo dell'MVP:

- una ricerca completa mostra "Ho capito: …" entro ~3 s e le card entro ~12 s;
- nessun link verso Amazon esce senza tag affiliato;
- la spesa è limitata in modo rigido (§7), anche in caso di abuso o di bug;
- il risultato ha un URL condivisibile che si riapre senza nuovi costi.

`<DOMINIO>` è un dominio già presente nell'account Cloudflare di Mirko; si sceglie al primo deploy.

## 2. Decisioni prese

| Tema | Decisione | Motivo |
|---|---|---|
| Fonte prodotti | Apify `junglee/amazon-crawler`, proxy IT, `scrapeProductDetails: false`, dietro l'interfaccia `ProductSource` | Spike 2026-10-02: unico actor con 15/15 risultati, voto e numero recensioni; ~8 s per 3 ricerche in parallelo; titoli italiani con proxy IT |
| Passaggio futuro | Adattatore Creators API quando l'account Associates fa 10 vendite in 30 giorni | Basta aggiungere un adattatore a `ProductSource` |
| AI | OpenRouter, modello `deepseek/deepseek-v4.1-flash` (configurabile), ragionamento disattivato | Test 2026-10-02 su 5 modelli: tempi più costanti (2,9–5,7 s per i due passi), motivazioni buone, ~$0,0004 a richiesta |
| Hosting | Cloudflare Workers + D1, piano gratuito | Uso commerciale consentito; Vercel Hobby lo vieta esplicitamente per siti di affiliazione |
| Stack | Hono (Worker, API, SSE) + Vite + Preact (pagina) + TypeScript | Un solo progetto, un solo deploy, pagina leggera su mobile |
| Esperienza | Pagina unica progressiva + risultato condivisibile su `/r/<id>` | |
| Protezione spesa | 6 difese in un modulo dedicato `guard/` (§7) | |
| Fuori MVP | Jev (TypeSafe) per migliorare la selezione, Creators API, verdetto "Sconto vero?", altri negozi, account, chat | §12 |

## 3. Architettura

```
Browser (Vite + Preact, mobile-first)
   │  POST /api/cerca {testo, turnstileToken, src?}     → risposta SSE
   ▼
Cloudflare Worker (Hono)
   ├─ guard.checkAccesso        difese 1, 2 → procedi | leggera | blocca(motivo)
   ├─ cache richieste           testo normalizzato già visto (24 h) → risultato salvato, fine
   ├─ 1. CAPIRE    ai.capire(testo)                       → evento SSE "capito"
   │                {regalo: bool, destinatario, interessi[], budgetMax, occasione, ricerche[3], titolo}
   │                regalo=false → evento "non_capito", stop (difesa 5)
   ├─ guard.checkSpesa          difese 3, 6 → procedi | leggera
   │                (saltato se tutte e 3 le ricerche sono già in cache: nessuna spesa)
   ├─ 2. CERCARE   ProductSource.search(ricerca, budgetMax) ×3 in parallelo
   │                cache ricerche (24 h) · filtri prodotto (§6.3)
   │                (solo in modalità completa)
   ├─ 3. SCEGLIERE ai.scegli(richiesta, candidati)        → evento SSE "risultati"
   │                id verificati; fallback deterministico
   └─ 4. SALVARE   D1 risultati → evento SSE "salvato" {id}
GET  /r/<id>       pagina del risultato salvato (nessuna spesa)
POST /api/evento   click / condivisione (navigator.sendBeacon)
```

Moduli (`src/`):

| Modulo | Responsabilità | Dipende da |
|---|---|---|
| `guard/` | difese 1, 2, 3, 6; una funzione per difesa, tutte con la stessa firma; `checkAccesso` e `checkSpesa` | D1, binding `ratelimit`, Turnstile |
| `ai/` | `capire()` e `scegli()`: prompt, chiamata OpenRouter, validazione JSON | OpenRouter |
| `products/` | interfaccia `ProductSource`, adattatore `ApifySource`, filtri prodotto | Apify |
| `affiliate.ts` | **unico** punto in cui si costruiscono i link Amazon | — |
| `store/` | accesso a D1: risultati, cache, contatori, eventi | D1 |
| `flow.ts` | orchestrazione dei passi 1–4 ed eventi SSE | tutti i precedenti |
| `web/` | pagina Preact: stati, card, condivisione, beacon | API |

Ogni modulo si testa da solo con dipendenze simulate.

## 4. Contratti

```ts
interface Capito {
  regalo: boolean;                 // false = testo non è una richiesta di regalo
  destinatario: string | null;
  interessi: string[];             // max 3
  budgetMax: number | null;        // euro; null = nessun tetto dichiarato → 100
  occasione: string | null;
  ricerche: [string, string, string];   // 2–5 parole, tipi di prodotto diversi
  titolo: string;                  // "3 regali per una mamma che ama il giardinaggio"
}

interface Prodotto {
  asin: string; titolo: string; immagine: string | null;
  prezzo: number; prezzoListino: number | null;   // null se assente o non plausibile
  stelle: number; recensioni: number;
  rilevatoIl: string;              // ISO, per "Prezzi rilevati alle…"
}

interface ProductSource {
  search(query: string, budgetMax: number, max: number): Promise<Prodotto[]>;
}

interface Scelta { asin: string; perche: string | null }  // ≤ 140 caratteri; null solo nel fallback deterministico

type EventoSSE =
  | { tipo: "capito"; capito: Capito }
  | { tipo: "non_capito" }
  | { tipo: "risultati"; modalita: "completa"; scelte: (Scelta & { prodotto: Prodotto })[]; idee: Idea[] }
  | { tipo: "risultati"; modalita: "leggera"; idee: Idea[] }
  | { tipo: "salvato"; id: string }
  | { tipo: "bloccato"; motivo: "troppe_richieste" | "verifica_fallita" }
  | { tipo: "errore" };

interface Idea { ricerca: string; perche: string | null }   // → "Cerca su Amazon"
```

## 5. Esperienza utente

Mockup approvati in brainstorming (visual companion, schermate `flusso.html` e `pagine.html`).

1. **Home**: titolo *"Dimmi per chi è e quanto vuoi spendere. Ti dico cosa regalare."*, campo di testo (3–300 caratteri),
   pulsante "Trova il regalo", 3 esempi cliccabili che riempiono il campo e avviano la ricerca.
   Dichiarazione affiliato visibile già qui, non solo nel footer.
2. **Ricerca in corso**: il campo sale in alto; all'evento `capito` compaiono le etichette (destinatario, interessi, budget)
   e 3 card scheletro con il nome della ricerca ("🔎 cerco: set attrezzi giardinaggio…").
3. **Risultato (completa)**: 3 card con foto, titolo, prezzo, prezzo di listino barrato + badge sconto (solo se plausibile),
   stelle e recensioni, perché, pulsanti **Vedi su Amazon** e **Aggiungi al carrello**. Sotto: **Condividi**,
   **Mandalo a te / apri sul computer**, **Altre idee**. Nota "Prezzi rilevati alle HH:MM, possono cambiare".
4. **Risultato (leggera)**: 3 idee con il perché e il pulsante **Cerca su Amazon**, senza prezzi né foto.
   Usata oltre quota/tetto, se Turnstile non è verificabile o se Apify non risponde.
5. **Risultati misti**: se dopo i filtri restano meno di 3 prodotti, card per quelli trovati + idee per completare.
6. **Pagina condivisa `/r/<id>`**: titolo generato, prodotti con i prezzi fotografati e la data ("Prezzi del 2 ottobre,
   controlla su Amazon quello attuale"), pulsante "Cerca un regalo per qualcun altro". Non ri-aggiorna i prezzi.
7. **Messaggi**: richiesta non capita (con esempio), troppe ricerche (riprova tra un minuto), pochi risultati, errore generico.
   La pagina non resta mai vuota o rotta.

**Altre idee** = nuova ricerca con lo stesso `Capito`, escludendo gli ASIN già mostrati; conta nella quota.

Niente account, login o banner cookie: un solo cookie tecnico (identificativo anonimo per la quota).

## 6. Flusso di ricerca in dettaglio

### 6.1 Capire (AI passo 1)

- Input: testo dell'utente ripulito (URL ed email rimossi, max 300 caratteri).
- Output: `Capito` validato. JSON non valido → 1 nuovo tentativo → evento `errore`.
- Timeout 6 s per chiamata.
- `regalo: false` per testi vuoti, casuali, fuori tema o con istruzioni al modello ("ignora le istruzioni…") → `non_capito`.
- `budgetMax` assente → 100 €.

### 6.2 Cercare (Apify)

- 3 ricerche in parallelo, `maxItemsPerStartUrl` configurabile (default 5), URL
  `https://www.amazon.it/s?k=<ricerca>&rh=p_36%3A-<budget*100>&language=it_IT`, `proxyCountry: IT`.
- Timeout 20 s per ricerca; una ricerca fallita non ferma le altre; tutte fallite → modalità leggera.
- Cache per chiave `(ricerca normalizzata, budgetMax)` per 24 h, condivisa tra utenti.

### 6.3 Filtri prodotto (codice, non AI)

Un prodotto entra tra i candidati solo se:

- `prezzo` presente e `0 < prezzo ≤ budgetMax` (scarta anche prezzi assurdi come i 1.597.122 € visti nello spike);
- `stelle ≥ MIN_STELLE` (default 4,0) e `recensioni ≥ MIN_RECENSIONI` (default 20);
- ASIN non già mostrato (per "Altre idee"), deduplicato tra le 3 ricerche.

`prezzoListino` è tenuto solo se `prezzo < prezzoListino ≤ prezzo × 4`; altrimenti `null` (niente badge sconto).

### 6.4 Scegliere (AI passo 2)

- Input: testo dell'utente + candidati `{asin, titolo, prezzo, stelle, recensioni}`.
- Output: 3 `Scelta` con ASIN distinti presenti tra i candidati, `perche` non vuoto, ≤ 140 caratteri (troncato a parola se più lungo).
- Errore, timeout (6 s), JSON non valido o ASIN inventati → **fallback deterministico**: i 3 candidati con
  punteggio `stelle × log10(recensioni + 1)` più alto, provenienti preferibilmente da ricerche diverse, con
  `perche` = null (la card mostra solo i dati).

### 6.5 Salvare

Risultato salvato in D1 con id breve (8 caratteri base62). Errore D1 → la ricerca va a buon fine comunque,
il pulsante Condividi viene nascosto (`salvato` non arriva).

## 7. Protezione della spesa — modulo `guard/`

Ogni difesa è una funzione `(ctx) => Promise<"procedi" | "leggera" | { blocca: Motivo }>`. Due punti di controllo,
ciascuno esegue le sue difese in ordine e si ferma alla prima che non restituisce `procedi`:

- `checkAccesso` (difese 1, 2) **prima di tutto**, così i bot non arrivano nemmeno alla cache o all'AI;
- `checkSpesa` (difese 3, 6) **subito prima di Apify**, così le risposte dalla cache e le richieste scartate dal filtro AI
  non consumano quota. Ogni decisione diversa da `procedi` viene registrata
in `eventi` (tipo `blocco`, difesa, motivo). Tutti i limiti sono variabili d'ambiente (§9).

| # | Difesa | Regola (valori iniziali) | Esito |
|---|---|---|---|
| 1 | Turnstile | token obbligatorio su `/api/cerca`, verificato con siteverify (monouso, scade in 5 min) | non valido → `blocca(verifica_fallita)`; siteverify irraggiungibile → `leggera` |
| 2 | Limite di velocità | binding `ratelimit`: `RATE_PER_MINUTO` = 3 ricerche/minuto per IP | `blocca(troppe_richieste)` |
| 3 | Quota visitatore | `QUOTA_VISITATORE` = 5 ricerche complete/giorno per visitatore | oltre → `leggera` |
| 4 | Cache | testo normalizzato già visto → risultato salvato; ricerca Amazon già fatta → prodotti in cache | nessun costo (nel flusso, non in `guard/`) |
| 5 | Filtro AI | `Capito.regalo = false` → stop prima di Apify | costo solo del passo 1 (nel flusso) |
| 6 | Tetti rigidi | `TETTO_GIORNALIERO` = 150 ricerche complete/giorno in totale | oltre → `leggera` per tutti |

Tetti esterni, impostati nei pannelli (fuori dal codice, ultima garanzia):

- Apify: limite di spesa mensile (es. $30);
- OpenRouter: limite di credito sulla chiave dedicata al progetto (es. $5).

**Visitatore** = `sha256(IP + id cookie + segreto del giorno)`: cambia ogni giorno, l'IP non viene salvato.

**Avviso**: quando il contatore globale raggiunge l'80% di `TETTO_GIORNALIERO` (una volta al giorno), il Worker invia un
messaggio Telegram con `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` (chiamata HTTP diretta all'API Telegram, nessuna
dipendenza dal codice di BotTelegram).

Si conta come "ricerca completa" solo quella che chiama Apify (cache esclusa).

## 8. Link affiliati

Costruiti **solo** in `affiliate.ts`, con test su ogni formato:

| Pulsante | URL |
|---|---|
| Vedi su Amazon | `https://www.amazon.it/dp/<ASIN>?tag=mirkopapadopo-21` |
| Aggiungi al carrello | `https://www.amazon.it/gp/aws/cart/add.html?ASIN.1=<ASIN>&Quantity.1=1&tag=mirkopapadopo-21` |
| Cerca su Amazon | `https://www.amazon.it/s?k=<ricerca>&tag=mirkopapadopo-21` |
| Android dentro Instagram | `intent://www.amazon.it/dp/<ASIN>?tag=mirkopapadopo-21#Intent;scheme=https;package=com.amazon.mShop.android.shopping;S.browser_fallback_url=<URL https codificato>;end` |

Regole:

- link **diretti** ad amazon.it (nessun redirect nostro), `target="_blank" rel="noopener sponsored"`;
- il click viene registrato con `navigator.sendBeacon('/api/evento')`: se il beacon fallisce si perde il conteggio, mai la commissione;
- **browser interno di Instagram** (user agent contiene `Instagram`): banner *"Apri nel browser per acquistare con la tua app Amazon"*; su Android i pulsanti prodotto usano il link `intent://`;
- **cambio dispositivo**: "Aggiungi al carrello" attribuisce l'articolo anche se acquistato da un altro dispositivo
  (Associates Central, pagina Commissioni); "Mandalo a te" condivide `/r/<id>` così il click affiliato si ripete sul computer.

Verificato su Associates Central (2026-10-02): le commissioni valgono anche quando il link apre l'app Amazon Shopping, e per
articoli messi nel carrello e acquistati da un altro dispositivo.

**Da verificare su telefono vero prima del lancio** (§10): add-to-cart su amazon.it con tag, `intent://` da Instagram su Android,
banner su iOS, apertura dell'app Amazon dal link `/dp/` fuori da Instagram.

## 9. Dati e configurazione

### 9.1 Tabelle D1

```sql
CREATE TABLE risultati (
  id TEXT PRIMARY KEY,               -- 8 caratteri base62
  creato_il TEXT NOT NULL,
  titolo TEXT NOT NULL,
  capito_json TEXT NOT NULL,         -- Capito senza testo originale
  contenuto_json TEXT NOT NULL,      -- scelte + prodotti fotografati, oppure idee
  modalita TEXT NOT NULL CHECK (modalita IN ('completa','leggera')),
  src TEXT
);
CREATE TABLE cache_ricerche (
  chiave TEXT PRIMARY KEY,           -- sha256(ricerca normalizzata | budgetMax)
  prodotti_json TEXT NOT NULL,
  scade_il TEXT NOT NULL
);
CREATE TABLE cache_richieste (
  hash_testo TEXT PRIMARY KEY,       -- sha256(testo normalizzato)
  risultato_id TEXT NOT NULL REFERENCES risultati(id),
  scade_il TEXT NOT NULL
);
CREATE TABLE contatori (
  giorno TEXT NOT NULL,              -- YYYY-MM-DD Europe/Rome
  chiave TEXT NOT NULL,              -- 'globale' | 'v:<hash visitatore>' | 'avviso80'
  valore INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (giorno, chiave)
);
CREATE TABLE eventi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ricerca','click','carrello','condivisione','blocco')),
  risultato_id TEXT,
  asin TEXT,
  difesa TEXT,
  dettaglio TEXT,                    -- es. modalità, motivo del blocco
  src TEXT
);
```

**Normalizzazione del testo** per la cache: minuscole, spazi multipli ridotti, punteggiatura e emoji rimosse, cifre e "€" mantenuti.

**Privacy**: il testo libero dell'utente non viene salvato (solo il suo hash e i dati estratti). Nessun IP in chiaro.
Cron giornaliero: cancella `eventi` più vecchi di 90 giorni, cache scadute, `contatori` più vecchi di 7 giorni.

### 9.2 Variabili d'ambiente (modificabili dal pannello, senza deploy)

| Variabile | Default |
|---|---|
| `AI_MODEL` | `deepseek/deepseek-v4.1-flash` |
| `AI_TIMEOUT_MS` | 6000 |
| `APIFY_ACTOR` | `junglee~amazon-crawler` |
| `APIFY_RISULTATI_PER_RICERCA` | 5 |
| `APIFY_TIMEOUT_MS` | 20000 |
| `MIN_STELLE` / `MIN_RECENSIONI` | 4.0 / 20 |
| `RATE_PER_MINUTO` | 3 (nel binding `ratelimit`, richiede deploy) |
| `QUOTA_VISITATORE` | 5 |
| `TETTO_GIORNALIERO` | 150 |
| `AFFILIATE_TAG` | `mirkopapadopo-21` |
| `TURNSTILE_SITE_KEY` | (dal pannello Turnstile) |

### 9.3 Segreti (`wrangler secret`, mai nel repo; in locale `.dev.vars`, ignorato da git)

`APIFY_TOKEN`, `OPENROUTER_API_KEY` (chiave dedicata al progetto), `TURNSTILE_SECRET`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `VISITOR_SALT`.

Nota: il token Apify usato negli spike è passato in chat; va rigenerato prima del deploy.

## 10. Gestione errori e test

### 10.1 Errori

| Guasto | Comportamento |
|---|---|
| AI passo 1 in errore/timeout | 1 nuovo tentativo, poi evento `errore` |
| Apify: una ricerca fallisce | le altre proseguono |
| Apify: tutte falliscono | modalità leggera con le ricerche del passo 1 |
| Meno di 3 prodotti filtrati | card trovate + idee per completare |
| AI passo 2 non valido | fallback deterministico (§6.4) |
| D1 non disponibile | ricerca completata senza cache, salvataggio né conteggi; Condividi nascosto; tetti esterni come garanzia |
| Turnstile siteverify irraggiungibile | modalità leggera |

### 10.2 Test (Vitest + `@cloudflare/vitest-pool-workers`)

- **Unitari**: `affiliate.ts` (tutti i formati, codifica, `intent://`), filtri prodotto (prezzi anomali, listino non
  plausibile, soglie, deduplica), normalizzazione del testo, ogni difesa di `guard/`, validazione del JSON dell'AI, fallback deterministico.
- **Integrazione**: flusso completo con OpenRouter e Apify simulati da fixture prese dagli spike reali; sequenza degli
  eventi SSE per ogni riga della tabella §10.1; quota e tetto che portano in modalità leggera.
- **Contratto `ProductSource`**: suite condivisa che ogni adattatore deve superare.
- **Nessuna chiamata a servizi a pagamento** nella suite automatica.
- **Verifica nel browser** prima di dichiarare finita una funzionalità: ricerca vera da desktop e mobile emulato.
- **Checklist pre-lancio su telefono vero**: §8 "Da verificare".

## 11. Documentazione da produrre

- `docs/architettura.md`: flusso, moduli, contratti
- `docs/protezioni.md`: le 6 difese, i valori e dove si cambiano
- `docs/affiliazione.md`: formati dei link, regole mobile, checklist di verifica
- `docs/operazioni.md`: segreti, deploy, tetti nei pannelli Apify/OpenRouter, cosa fare all'avviso dell'80%
- `docs/README.md`: indice aggiornato

## 12. Fuori dall'MVP

- **Jev (TypeSafe)** per valutare i candidati (Score "adatto alla persona", Noul "è un regalo, non un ricambio/accessorio")
  se la selezione dell'LLM si rivela debole. L'interfaccia del passo 2 resta separata per poterlo aggiungere.
- **Creators API** come nuovo `ProductSource` dopo le 10 vendite qualificate.
- Verdetto "Sconto vero?" con storico prezzi.
- Negozi diversi da Amazon (es. campagne Metapic).
- Account, liste salvate, raffinamento in stile chat.

## 13. Costi attesi

| Voce | Per ricerca completa | Note |
|---|---|---|
| Apify | ~$0,075 (15 risultati × $0,005) | cache per ricerca abbatte le ripetute |
| OpenRouter | ~$0,0004 | |
| Modalità leggera / cache | ~$0,0002 / $0 | |
| Cloudflare | €0 | piano gratuito Workers + D1 + Turnstile |

Tetto massimo mensile garantito: limite Apify + limite OpenRouter (valori iniziali $30 + $5).
