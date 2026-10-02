import { useReducer, useRef, useState } from "preact/hooks";
import { MIN_TESTO } from "../../shared/testo";
import { cerca, type ConfigPubblica, inviaEvento, leggiSrc } from "../api";
import { oraRoma } from "../formato";
import { avviaRicercaSicura } from "../ricerca";
import { riduci, STATO_INIZIALE, type Messaggio } from "../stato";
import { ottieniToken } from "../turnstile";
import { BannerInstagram } from "./BannerInstagram";
import { Card } from "./Card";
import { Etichetta, Preparazioni } from "./Etichetta";
import { Footer } from "./Footer";
import { Icona } from "./Icona";
import { Idee } from "./Idee";

const ESEMPI = ["Mio papà, corre la maratona, 50 €", "Amico segreto in ufficio, 15 €", "La mia ragazza, ama leggere gialli, 30 €"];

const TESTI_MESSAGGIO: Record<Messaggio, string> = {
  non_capito: "Non ho capito per chi è il regalo. Prova a scrivere così: “mio fratello, ama la montagna, 30 €”.",
  troppe_richieste: "Hai preparato molti regali di fila. Riprova tra un minuto.",
  verifica_fallita: "La verifica di sicurezza non è andata a buon fine. Ricarica la pagina e riprova.",
  errore: "Qualcosa non ha funzionato durante la preparazione. Riprova.",
};

export function Consulente({ config }: { config: ConfigPubblica }) {
  const [stato, invia] = useReducer(riduci, STATO_INIZIALE);
  const [testo, setTesto] = useState("");
  const [avviso, setAvviso] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const src = leggiSrc();

  async function avvia(t: string, altre: boolean) {
    const pulito = t.trim();
    if (pulito.length < MIN_TESTO || stato.fase === "cerca") return;
    setAvviso(null);
    invia({ tipo: "avvia", testo: pulito, altre });
    await avviaRicercaSicura({
      ottieniToken: () => ottieniToken(turnstileRef.current!, config.turnstileSiteKey),
      cerca: (token) =>
        cerca({ testo: pulito, turnstileToken: token, src, escludi: altre ? stato.mostrati : [] }, (evento) => invia({ tipo: "evento", evento })),
      errore: () => invia({ tipo: "evento", evento: { tipo: "errore" } }),
      fine: () => invia({ tipo: "fine" }),
    });
  }

  async function condividi(perSe: boolean) {
    if (!stato.id) return;
    const url = `${location.origin}/r/${stato.id}`;
    inviaEvento({ tipo: "condivisione", risultatoId: stato.id, src });
    if (!perSe && navigator.share) {
      await navigator.share({ title: stato.capito?.titolo ?? "Idee regalo", url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    setAvviso(perSe ? "Link copiato. Aprilo sul computer per continuare da lì." : "Link copiato.");
  }

  const inHome = stato.fase === "home";
  const inCorso = stato.fase === "cerca";
  const capito = stato.capito;
  const primoProdotto = stato.scelte[0]?.prodotto;

  return (
    <main class={`pagina ${inHome ? "pagina-home" : "pagina-lavoro"}`}>
      <header class="testata">
        <a class="marchio" href="/">
          cosaregalo
        </a>
        <span class="testata-motto">consulenza per regali</span>
      </header>
      <BannerInstagram />

      <form
        class={`etichetta etichetta-modulo ${inHome ? "" : "etichetta-compatta"}`}
        onSubmit={(e) => {
          e.preventDefault();
          void avvia(testo, false);
        }}
      >
        <div class="etichetta-cornice">
          {inHome ? (
            <>
              <h1 class="etichetta-titolo">Tre regali su misura, scelti per una persona.</h1>
              <p class="etichetta-guida">
                <span>Per chi</span>
                <span>Cosa ama</span>
                <span>Fino a quanto</span>
              </p>
            </>
          ) : null}
          <label class="visualmente-nascosto" for="richiesta">
            Per chi è il regalo, cosa ama e quanto vuoi spendere
          </label>
          <textarea
            id="richiesta"
            value={testo}
            maxLength={300}
            rows={inHome ? 3 : 2}
            placeholder="Es. mia mamma, ama il giardinaggio, 40 €"
            onInput={(e) => setTesto((e.target as HTMLTextAreaElement).value)}
          />
          <button class="pulsante pulsante-attivo" type="submit" disabled={inCorso || testo.trim().length < MIN_TESTO}>
            {inCorso ? "In preparazione…" : inHome ? "Prepara i regali" : "Prepara di nuovo"}
            {inCorso ? null : <Icona nome="freccia" />}
          </button>
        </div>
      </form>
      <div ref={turnstileRef} class="turnstile" />

      {inHome && (
        <section class="esempi" aria-label="Esempi">
          <p class="esempi-titolo">Oppure parti da un esempio</p>
          <ul>
            {ESEMPI.map((es) => (
              <li key={es}>
                <button
                  type="button"
                  class="cartellino"
                  onClick={() => {
                    setTesto(es);
                    void avvia(es, false);
                  }}
                >
                  {es}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {capito && <Etichetta capito={capito} />}
      {inCorso && capito && <Preparazioni ricerche={capito.ricerche} />}
      {inCorso && !capito && <p class="nota nota-attesa">Leggo la richiesta…</p>}

      {stato.messaggio && (
        <p class="messaggio" role="status">
          <Icona nome="avviso" />
          {TESTI_MESSAGGIO[stato.messaggio]}
        </p>
      )}

      {stato.fase === "fatto" && stato.modalita && (
        <section class="esito" aria-label="Regali preparati">
          {stato.modalita === "leggera" ? (
            <p class="nota nota-leggera">Ecco tre idee da completare su Amazon: scegli tu il modello che preferisci.</p>
          ) : null}
          {stato.scelte.length > 0 ? (
            <div class="rimedi">
              {stato.scelte.map((s, i) => (
                <Card key={s.asin} scelta={s} indice={i} tag={config.affiliateTag} risultatoId={stato.id} src={src} />
              ))}
            </div>
          ) : null}
          {stato.modalita === "completa" && stato.idee.length > 0 ? (
            <p class="nota">Con questo budget ho trovato meno prodotti del solito. Altre idee da cercare:</p>
          ) : null}
          <Idee idee={stato.idee} tag={config.affiliateTag} risultatoId={stato.id} src={src} />
          {primoProdotto ? <p class="nota">Prezzi rilevati alle {oraRoma(primoProdotto.rilevatoIl)}, possono cambiare.</p> : null}
          <div class="azioni">
            {stato.id ? (
              <>
                <button class="pulsante pulsante-filetto" type="button" onClick={() => void condividi(false)}>
                  <Icona nome="condividi" /> Condividi
                </button>
                <button class="pulsante pulsante-filetto" type="button" onClick={() => void condividi(true)}>
                  <Icona nome="schermo" /> Mandalo a te
                </button>
              </>
            ) : null}
            <button class="pulsante pulsante-filetto" type="button" onClick={() => void avvia(stato.testo, true)}>
              <Icona nome="rinnova" /> Altre idee
            </button>
          </div>
          {avviso ? (
            <p class="nota" role="status">
              {avviso}
            </p>
          ) : null}
        </section>
      )}
      <Footer />
    </main>
  );
}
