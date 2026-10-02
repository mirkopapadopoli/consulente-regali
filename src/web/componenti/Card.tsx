import { linkCarrello, linkIntentAndroid, linkProdotto } from "../../shared/affiliate";
import type { SceltaConProdotto } from "../../shared/types";
import { isAndroid, isInstagram } from "../ambiente";
import { inviaEvento } from "../api";
import { euro } from "../formato";
import { Icona } from "./Icona";
import { NUMERALI } from "./Etichetta";

export function Card({
  scelta,
  indice,
  tag,
  risultatoId,
  src,
}: {
  scelta: SceltaConProdotto;
  indice: number;
  tag: string;
  risultatoId: string | null;
  src: string | null;
}) {
  const p = scelta.prodotto;
  const ua = navigator.userAgent;
  const href = isInstagram(ua) && isAndroid(ua) ? linkIntentAndroid(p.asin, tag) : linkProdotto(p.asin, tag);
  const sconto = p.prezzoListino ? Math.round((1 - p.prezzo / p.prezzoListino) * 100) : 0;
  return (
    <article class="rimedio" style={{ "--i": indice }}>
      <header class="rimedio-testa">
        <span class="numerale">{NUMERALI[indice] ?? indice + 1}</span>
        <span class="rimedio-segno">pronto</span>
      </header>
      <div class="rimedio-corpo">
        <div class="fiala">{p.immagine ? <img src={p.immagine} alt="" loading="lazy" decoding="async" /> : null}</div>
        <div class="rimedio-testo">
          {scelta.perche ? <p class="perche">{scelta.perche}</p> : null}
          <h3 class="rimedio-titolo">{p.titolo}</h3>
          <p class="rimedio-dati">
            <span class="prezzo">{euro(p.prezzo)}</span>
            {sconto >= 5 && p.prezzoListino ? (
              <>
                <s class="listino">{euro(p.prezzoListino)}</s>
                <span class="sconto">−{sconto}%</span>
              </>
            ) : null}
            <span class="voto">
              ★ {p.stelle.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span class="recensioni"> · {p.recensioni.toLocaleString("it-IT")} recensioni</span>
            </span>
          </p>
        </div>
      </div>
      <footer class="rimedio-azioni">
        <a class="pulsante pulsante-pieno" href={href} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "click", asin: p.asin, risultatoId, src })}>
          Vedi su Amazon <Icona nome="esterno" />
        </a>
        <a class="pulsante pulsante-filetto" href={linkCarrello(p.asin, tag)} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "carrello", asin: p.asin, risultatoId, src })}>
          <Icona nome="carrello" /> Aggiungi al carrello
        </a>
      </footer>
    </article>
  );
}
