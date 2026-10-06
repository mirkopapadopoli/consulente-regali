# Statistiche: visite e uso del sito

Due fonti, entrambe su Cloudflare:

| Cosa | Dove | Come |
|---|---|---|
| Visite, pagine viste, provenienza (Instagram, Google…), paesi, dispositivi | **Cloudflare Web Analytics** | script senza cookie caricato dalla pagina se `WEB_ANALYTICS_TOKEN` è impostato |
| Visite per canale (`visita`), ricerche, click "Vedi su Amazon", "Aggiungi al carrello", condivisioni, blocchi delle difese | **D1**, tabella `eventi` | registrati dal sito (`/api/cerca`, `/api/evento`) |

Le vendite vere e le commissioni si vedono solo nel pannello Amazon Associates (tag `mirkopapadopo-21`).

## Da dove arriva la gente: `?src=`

Il sito legge il parametro `src` del link, lo tiene per la sessione e lo salva su ogni ricerca ed evento. Un valore per canale:

- `https://cosaregalo.mirkopapadopoli.com/?src=ig-bio`
- `https://cosaregalo.mirkopapadopoli.com/?src=ig-storia`
- `https://cosaregalo.mirkopapadopoli.com/?src=tg`

Massimo 40 caratteri, solo lettere, numeri, `-` e `_`. Senza parametro l'evento conta come "diretto".

Web Analytics non vede `src` (registra il percorso senza query string), quindi non distingue pubblicità, DM e bio. Per questo il sito registra anche un evento **`visita`** in D1, con la sua `src`:

- uno per sessione del browser: ricaricare o tornare alla home non conta come nuova visita
- `dettaglio` = `home` oppure `condivisa` (pagina `/r/<id>` aperta da un link condiviso)
- parte solo se la pagina esegue JavaScript, quindi i crawler delle anteprime (Meta, WhatsApp) non contano

### Ricerche dalla cache

Una ricerca uguale a una già fatta nelle ultime ore viene servita dalla cache, gratis. Viene comunque registrata come `ricerca` con `dettaglio = 'cache'`, così:

- il conteggio delle ricerche per canale è completo (gli esempi pronti in home finiscono spesso in cache)
- le ricerche pagate si contano escludendo `dettaglio = 'cache'`

Gli eventi registrati prima del 2026-10-06 non contengono le ricerche dalla cache né le visite.

## Attivare Web Analytics

1. Dashboard Cloudflare → **Analytics & Logs → Web Analytics → Add a site** → `cosaregalo.mirkopapadopoli.com`.
2. Scegli l'installazione **manuale** (snippet JS), non quella automatica: lo script lo carica già il sito, l'automatica lo raddoppierebbe.
3. **Non** attivare "escludi visitatori UE": il pubblico è italiano, non vedresti niente.
4. Dallo snippet copia il valore di `"token"` in `wrangler.jsonc` → `vars.WEB_ANALYTICS_TOKEN`, poi deploy. È un token pubblico, sta in chiaro nella pagina.

Lo script è cookieless: niente banner di consenso.

## `npm run numeri`

Riepilogo nel terminale, per canale: visite, ricerche per visita, ricerche, click, carrello, condivisioni e click per ricerca. Legge D1 di produzione con wrangler (serve `wrangler login`).

- `npm run numeri`: ultimi 7 giorni
- `npm run numeri -- 30`: ultimi 30

Per aggiungere le visite crea `.numeri.env` nella root (è in `.gitignore`):

```
CLOUDFLARE_API_TOKEN=...      # token API con permesso "Account Analytics: Read"
CF_ACCOUNT_ID=...             # dashboard → Workers & Pages → Account ID
CF_WEB_ANALYTICS_SITE_TAG=... # Web Analytics → sito → ID del sito (site tag)
```

Senza queste variabili, o se l'API risponde con un errore, il comando stampa solo gli eventi di D1 e dice perché.

## Query a mano

Dashboard → Storage & Databases → D1 → `consulente-regali` → Console:

```sql
SELECT COALESCE(src,'diretto') AS canale, tipo, COUNT(*) AS n
FROM eventi WHERE quando >= date('now','-7 day')
GROUP BY canale, tipo ORDER BY n DESC;
```

I prodotti più cliccati:

```sql
SELECT asin, COUNT(*) AS click FROM eventi
WHERE tipo = 'click' GROUP BY asin ORDER BY click DESC LIMIT 10;
```

Ricerche pagate e servite dalla cache:

```sql
SELECT CASE WHEN dettaglio = 'cache' THEN 'cache' ELSE 'pagata' END AS costo, COUNT(*) AS n
FROM eventi WHERE tipo = 'ricerca' GROUP BY costo;
```

## Deploy di questa versione

La migrazione `0002_eventi_visita.sql` ricrea la tabella `eventi` (copiando i dati) per ammettere il tipo `visita`. Va applicata **prima** del deploy, altrimenti le visite vengono scartate in silenzio:

```
npx wrangler d1 migrations apply consulente-regali --remote
npm run deploy
```
