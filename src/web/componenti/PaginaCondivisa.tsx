import { useEffect, useState } from "preact/hooks";
import type { RisultatoPubblico } from "../../shared/types";
import { type ConfigPubblica, leggiRisultatoPubblico, leggiSrc } from "../api";
import { BannerInstagram } from "./BannerInstagram";
import { Card } from "./Card";
import { Etichetta } from "./Etichetta";
import { Footer } from "./Footer";
import { Icona } from "./Icona";
import { Idee } from "./Idee";
import { Testata } from "./Testata";

export function PaginaCondivisa({ id, config }: { id: string; config: ConfigPubblica }) {
  const [r, setR] = useState<RisultatoPubblico | null | "caricamento">("caricamento");
  const src = leggiSrc();
  useEffect(() => {
    leggiRisultatoPubblico(id).then(setR).catch(() => setR(null));
  }, [id]);

  return (
    <main class="pagina pagina-lavoro">
      <Testata inHome={false} />
      <BannerInstagram />
      {r === "caricamento" && <p class="attesa">
          <span class="punto" aria-hidden="true" />
          Apro i regali…
        </p>}
      {r === null && (
        <p class="messaggio" role="status">
          <Icona nome="avviso" />
          Questi regali non esistono più o il link è incompleto.
        </p>
      )}
      {r && r !== "caricamento" && (
        <>
          <Etichetta capito={r.capito} titolo={r.titolo} rilevatoIl={r.scelte[0]?.prodotto.rilevatoIl} />
          <section class="esito" aria-label="Regali scelti">
            {r.scelte.length > 0 ? (
              <div class="tessere">
                {r.scelte.map((s, i) => (
                  <Card key={s.asin} scelta={s} indice={i} tag={config.affiliateTag} risultatoId={r.id} src={src} />
                ))}
              </div>
            ) : null}
            <Idee idee={r.idee} tag={config.affiliateTag} risultatoId={r.id} src={src} />
            {r.scelte.length > 0 ? <p class="nota">Su Amazon trovi il prezzo di oggi.</p> : null}
          </section>
        </>
      )}
      <a class="pillola-primaria pillola-larga" href="/">
        Cerca un regalo per qualcun altro <Icona nome="freccia" />
      </a>
      <Footer />
    </main>
  );
}
