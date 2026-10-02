import { useEffect, useState } from "preact/hooks";
import type { RisultatoPubblico } from "../../shared/types";
import { type ConfigPubblica, leggiRisultatoPubblico, leggiSrc } from "../api";
import { dataRoma } from "../formato";
import { BannerInstagram } from "./BannerInstagram";
import { Card } from "./Card";
import { Etichetta } from "./Etichetta";
import { Footer } from "./Footer";
import { Icona } from "./Icona";
import { Idee } from "./Idee";

export function PaginaCondivisa({ id, config }: { id: string; config: ConfigPubblica }) {
  const [r, setR] = useState<RisultatoPubblico | null | "caricamento">("caricamento");
  const src = leggiSrc();
  useEffect(() => {
    leggiRisultatoPubblico(id).then(setR).catch(() => setR(null));
  }, [id]);

  return (
    <main class="pagina pagina-lavoro">
      <header class="testata">
        <a class="marchio" href="/">
          cosaregalo
        </a>
        <span class="testata-motto">consulenza per regali</span>
      </header>
      <BannerInstagram />
      {r === "caricamento" && <p class="nota nota-attesa">Apro la preparazione…</p>}
      {r === null && (
        <p class="messaggio" role="status">
          <Icona nome="avviso" />
          Questa preparazione non esiste più o il link è incompleto.
        </p>
      )}
      {r && r !== "caricamento" && (
        <>
          <Etichetta capito={r.capito} titolo={r.titolo} />
          <section class="esito" aria-label="Regali preparati">
            {r.scelte.length > 0 ? (
              <div class="rimedi">
                {r.scelte.map((s, i) => (
                  <Card key={s.asin} scelta={s} indice={i} tag={config.affiliateTag} risultatoId={r.id} src={src} />
                ))}
              </div>
            ) : null}
            <Idee idee={r.idee} tag={config.affiliateTag} risultatoId={r.id} src={src} />
            {r.scelte.length > 0 ? <p class="nota">Prezzi del {dataRoma(r.creatoIl)}: su Amazon trovi quello di oggi.</p> : null}
          </section>
        </>
      )}
      <a class="pulsante pulsante-attivo pulsante-largo" href="/">
        Prepara un regalo per qualcun altro <Icona nome="freccia" />
      </a>
      <Footer />
    </main>
  );
}
