import { useEffect, useState } from "preact/hooks";
import type { RisultatoPubblico } from "../../shared/types";
import { type ConfigPubblica, leggiRisultatoPubblico, leggiSrc } from "../api";
import { dataRoma } from "../formato";
import { BannerInstagram } from "./BannerInstagram";
import { Card } from "./Card";
import { Footer } from "./Footer";
import { Idee } from "./Idee";

export function PaginaCondivisa({ id, config }: { id: string; config: ConfigPubblica }) {
  const [r, setR] = useState<RisultatoPubblico | null | "caricamento">("caricamento");
  const src = leggiSrc();
  useEffect(() => {
    leggiRisultatoPubblico(id).then(setR).catch(() => setR(null));
  }, [id]);

  return (
    <main class="pagina">
      <header class="logo">
        cosa<span>regalo</span>
      </header>
      <BannerInstagram />
      {r === "caricamento" && <p class="nota">Carico le idee…</p>}
      {r === null && <p class="messaggio">Risultato non trovato: forse il link è incompleto.</p>}
      {r && r !== "caricamento" && (
        <section>
          <h1>{r.titolo}</h1>
          {r.capito.budgetMax && (
            <div class="chips">
              <span>≤ {r.capito.budgetMax} €</span>
            </div>
          )}
          {r.scelte.map((s) => (
            <Card key={s.asin} scelta={s} tag={config.affiliateTag} risultatoId={r.id} src={src} />
          ))}
          <Idee idee={r.idee} tag={config.affiliateTag} risultatoId={r.id} src={src} />
          {r.scelte.length > 0 && <p class="messaggio">Prezzi del {dataRoma(r.creatoIl)}: controlla su Amazon quello attuale.</p>}
        </section>
      )}
      <a class="btn" href="/">
        Cerca un regalo per qualcun altro
      </a>
      <Footer />
    </main>
  );
}
