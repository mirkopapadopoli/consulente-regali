import { linkCarrello, linkIntentAndroid, linkProdotto } from "../../shared/affiliate";
import type { SceltaConProdotto } from "../../shared/types";
import { isAndroid, isInstagram } from "../ambiente";
import { inviaEvento } from "../api";
import { euro } from "../formato";

export function Card({ scelta, tag, risultatoId, src }: { scelta: SceltaConProdotto; tag: string; risultatoId: string | null; src: string | null }) {
  const p = scelta.prodotto;
  const ua = navigator.userAgent;
  const href = isInstagram(ua) && isAndroid(ua) ? linkIntentAndroid(p.asin, tag) : linkProdotto(p.asin, tag);
  const sconto = p.prezzoListino ? Math.round((1 - p.prezzo / p.prezzoListino) * 100) : 0;
  return (
    <article class="card">
      {p.immagine ? <img src={p.immagine} alt="" loading="lazy" /> : <div class="img-vuota" />}
      <div class="card-corpo">
        <h3>{p.titolo}</h3>
        <p class="prezzo">
          <b>{euro(p.prezzo)}</b>
          {sconto >= 5 && p.prezzoListino && (
            <>
              <s>{euro(p.prezzoListino)}</s>
              <span class="badge">-{sconto}%</span>
            </>
          )}
        </p>
        <p class="voto">
          ★ {p.stelle.toLocaleString("it-IT")} ({p.recensioni.toLocaleString("it-IT")} recensioni)
        </p>
        {scelta.perche && <p class="perche">“{scelta.perche}”</p>}
        <a class="btn" href={href} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "click", asin: p.asin, risultatoId, src })}>
          Vedi su Amazon
        </a>
        <a class="btn2" href={linkCarrello(p.asin, tag)} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "carrello", asin: p.asin, risultatoId, src })}>
          Aggiungi al carrello
        </a>
      </div>
    </article>
  );
}

export function CardScheletro({ ricerca }: { ricerca: string }) {
  return (
    <article class="card scheletro">
      <div class="img-vuota" />
      <div class="card-corpo">
        <h3>🔎 cerco: {ricerca}…</h3>
        <div class="riga" />
        <div class="riga corta" />
      </div>
    </article>
  );
}
