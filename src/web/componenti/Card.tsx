import { linkCarrello, linkIntentAndroid, linkProdotto } from "../../shared/affiliate";
import type { SceltaConProdotto } from "../../shared/types";
import { isAndroid, isInstagram } from "../ambiente";
import { inviaEvento } from "../api";
import { euro } from "../formato";
import { NUMERALI } from "./Etichetta";
import { Icona } from "./Icona";

const COLORI_TESSERA = ["menta", "viola", "giallo"];

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
    <article class={`tessera tessera-${COLORI_TESSERA[indice % COLORI_TESSERA.length]}`} style={{ "--i": indice }}>
      <header class="tessera-testa">
        <span class="etichetta-mono">Scelta {NUMERALI[indice] ?? indice + 1}</span>
        {sconto >= 5 && p.prezzoListino ? <span class="pillola-mono">−{sconto}%</span> : null}
      </header>
      <div class="tessera-immagine">{p.immagine ? <img src={p.immagine} alt="" loading="lazy" decoding="async" /> : null}</div>
      {scelta.perche ? <p class="perche">{scelta.perche}</p> : null}
      <h3 class="tessera-titolo">{p.titolo}</h3>
      <p class="tessera-dati">
        <span class="prezzo">{euro(p.prezzo)}</span>
        {sconto >= 5 && p.prezzoListino ? <s class="listino">{euro(p.prezzoListino)}</s> : null}
        <span class="voto">
          <Icona nome="stella" class="icona icona-stella" />
          {p.stelle.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          <span class="recensioni"> · {p.recensioni.toLocaleString("it-IT")} recensioni</span>
        </span>
      </p>
      <footer class="tessera-azioni">
        <a class="pillola-azione" href={href} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "click", asin: p.asin, risultatoId, src })}>
          Vedi su Amazon <Icona nome="esterno" />
        </a>
        <a class="azione-testo" href={linkCarrello(p.asin, tag)} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "carrello", asin: p.asin, risultatoId, src })}>
          Aggiungi al carrello
        </a>
      </footer>
    </article>
  );
}
