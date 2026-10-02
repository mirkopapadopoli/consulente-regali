# Link affiliati

Tag `mirkopapadopo-21`, marketplace amazon.it. Tutti i link si costruiscono in `src/shared/affiliate.ts`.

| Pulsante | Funzione | URL |
|---|---|---|
| Vedi su Amazon | `linkProdotto` | `https://www.amazon.it/dp/<ASIN>?tag=mirkopapadopo-21` |
| Aggiungi al carrello | `linkCarrello` | `https://www.amazon.it/gp/aws/cart/add.html?ASIN.1=<ASIN>&Quantity.1=1&tag=…` |
| Cerca su Amazon | `linkRicerca` | `https://www.amazon.it/s?k=<ricerca>&tag=…` |
| Android dentro Instagram | `linkIntentAndroid` | `intent://…#Intent;scheme=https;package=com.amazon.mShop.android.shopping;S.browser_fallback_url=…;end` |

Regole: link diretti (nessun redirect), `rel="noopener sponsored"`, click misurato con `navigator.sendBeacon` (se fallisce si perde il conteggio, mai la commissione).

## Cosa dice Amazon.it (Associates Central, pagina Commissioni, verificato 2026-10-02)

- Commissioni riconosciute anche quando il link apre l'app Amazon Shopping.
- Articoli aggiunti al carrello dal primo dispositivo e acquistati da un altro: commissione riconosciuta.

## Checklist su telefono vero, prima del lancio

- [ ] iPhone, Safari: "Vedi su Amazon" apre l'app Amazon sul prodotto; nell'app l'URL mantiene il tag (condividi → copia link).
- [ ] Android, Chrome: idem.
- [ ] Android, dentro Instagram: il link `intent://` apre l'app Amazon; se l'app manca si apre il fallback https con il tag.
- [ ] iPhone, dentro Instagram: compare il banner "Apri nel browser".
- [ ] "Aggiungi al carrello" su amazon.it aggiunge il prodotto e mantiene il tag.
- [ ] Rapporto Associates del giorno dopo: compaiono i click di prova.

Già verificato in locale con browser headless (2026-10-02): tag presente su tutti i link `/dp/` e add-to-cart, link `intent://` generato con user agent Instagram Android, banner visibile.
