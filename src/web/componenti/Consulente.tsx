import { useReducer, useRef, useState } from "preact/hooks";
import { MIN_TESTO } from "../../shared/testo";
import { cerca, type ConfigPubblica, inviaEvento, leggiSrc } from "../api";
import { avviaRicercaSicura } from "../ricerca";
import { riduci, STATO_INIZIALE, type Messaggio } from "../stato";
import { ottieniToken } from "../turnstile";
import { BannerInstagram } from "./BannerInstagram";
import { Card } from "./Card";
import { Etichetta, Preparazioni } from "./Etichetta";
import { Footer } from "./Footer";
import { Icona } from "./Icona";
import { Idee } from "./Idee";
import { Testata } from "./Testata";
import { ComeFunziona, Invito, Nastro, Occasioni } from "./Vetrina";

const ESEMPI = ["Mio papà, corre la maratona, 50 €", "Amico segreto in ufficio, 15 €", "La mia ragazza, ama leggere gialli, 30 €"];

const TESTI_MESSAGGIO: Record<Messaggio, string> = {
  non_capito: "Non ho capito per chi è il regalo. Prova a scrivere così: “mio fratello, ama la montagna, 30 €”.",
  troppe_richieste: "Hai fatto molte ricerche di fila. Riprova tra un minuto.",
  verifica_fallita: "La verifica di sicurezza non è andata a buon fine. Ricarica la pagina e riprova.",
  errore: "Qualcosa non ha funzionato durante la ricerca. Riprova.",
};

export function Consulente({ config }: { config: ConfigPubblica }) {
  const [stato, invia] = useReducer(riduci, STATO_INIZIALE);
  const [testo, setTesto] = useState("");
  const [avviso, setAvviso] = useState<string | null>(null);
  const [troppoBreve, setTroppoBreve] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const src = leggiSrc();

  async function avvia(t: string, altre: boolean) {
    const pulito = t.trim();
    if (stato.fase === "cerca") return;
    if (pulito.length < MIN_TESTO) {
      setTroppoBreve(true);
      document.getElementById("richiesta")?.focus();
      return;
    }
    setTroppoBreve(false);
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

  function prepara(inizio: string) {
    setTesto(inizio);
    setTroppoBreve(false);
    const campo = document.getElementById("richiesta") as HTMLTextAreaElement | null;
    campo?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      campo?.focus();
      campo?.setSelectionRange(inizio.length, inizio.length);
    }, 350);
  }

  const inHome = stato.fase === "home";
  const inCorso = stato.fase === "cerca";
  const capito = stato.capito;
  const primoProdotto = stato.scelte[0]?.prodotto;

  return (
    <main class={`pagina ${inHome ? "pagina-home" : "pagina-lavoro"}`}>
      <Testata inHome={inHome} />
      <BannerInstagram />

      {inHome ? (
        <section class="apertura">
          <p class="sussurro">Dimmi per chi è e quanto vuoi spendere</p>
          <p class="marchio-gigante" aria-hidden="true">
            cosaregalo<span class="punto-domanda">?</span>
          </p>
          <h1 class="apertura-titolo">Tre regali su misura, in pochi secondi.</h1>
        </section>
      ) : null}

      <form
        class={`modulo ${inHome ? "" : "modulo-compatto"}`}
        onSubmit={(e) => {
          e.preventDefault();
          void avvia(testo, false);
        }}
      >
        <label class="etichetta-mono" for="richiesta">
          Per chi · cosa ama · fino a quanto
        </label>
        <textarea
          id="richiesta"
          value={testo}
          maxLength={300}
          rows={inHome ? 3 : 2}
          placeholder={"Es. mia mamma, ama il giardinaggio, 40\u00a0€"}
          onInput={(e) => setTesto((e.target as HTMLTextAreaElement).value)}
        />
        {inCorso ? null : (
          <button class="pillola-primaria" type="submit">
            {inHome ? "Prepara i regali" : "Cerca di nuovo"}
            <Icona nome="freccia" />
          </button>
        )}
      </form>
      <div ref={turnstileRef} class="turnstile" />
      {troppoBreve ? (
        <p class="messaggio" role="status">
          <Icona nome="avviso" />
          Scrivi per chi è il regalo, cosa ama e quanto vuoi spendere.
        </p>
      ) : null}

      {inHome && (
        <section class="esempi" aria-label="Esempi">
          <p class="etichetta-mono">Oppure prova</p>
          <ul>
            {ESEMPI.map((es) => (
              <li key={es}>
                <button
                  type="button"
                  class="pillola-esempio"
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

      {inHome && (
        <>
          <Nastro />
          <ComeFunziona />
          <Occasioni onScegli={prepara} />
          <Invito onInizia={() => prepara(testo)} />
        </>
      )}

      {capito && <Etichetta capito={capito} rilevatoIl={stato.fase === "fatto" ? primoProdotto?.rilevatoIl : undefined} />}
      {inCorso && capito && <Preparazioni ricerche={capito.ricerche} />}
      {inCorso && !capito && (
        <p class="attesa">
          <span class="punto" aria-hidden="true" />
          Leggo la richiesta…
        </p>
      )}

      {stato.messaggio && (
        <p class="messaggio" role="status">
          <Icona nome="avviso" />
          {TESTI_MESSAGGIO[stato.messaggio]}
        </p>
      )}

      {stato.fase === "fatto" && stato.modalita && (
        <section class="esito" aria-label="Regali scelti">
          {stato.modalita === "leggera" ? (
            <p class="nota nota-leggera">Ecco tre idee da completare su Amazon: scegli tu il modello che preferisci.</p>
          ) : null}
          {stato.scelte.length > 0 ? (
            <div class="tessere">
              {stato.scelte.map((s, i) => (
                <Card key={s.asin} scelta={s} indice={i} tag={config.affiliateTag} risultatoId={stato.id} src={src} />
              ))}
            </div>
          ) : null}
          {stato.modalita === "completa" && stato.idee.length > 0 ? (
            <p class="nota">Con questo budget ho trovato meno prodotti del solito. Altre idee da cercare:</p>
          ) : null}
          <Idee idee={stato.idee} tag={config.affiliateTag} risultatoId={stato.id} src={src} />
          <div class="azioni">
            {stato.id ? (
              <>
                <button class="pillola-secondaria" type="button" onClick={() => void condividi(false)}>
                  <Icona nome="condividi" /> Condividi
                </button>
                <button class="pillola-secondaria" type="button" onClick={() => void condividi(true)}>
                  <Icona nome="schermo" /> Mandalo a te
                </button>
              </>
            ) : null}
            <button class="pillola-secondaria" type="button" onClick={() => void avvia(stato.testo, true)}>
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
