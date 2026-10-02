import { useReducer, useRef, useState } from "preact/hooks";
import { MIN_TESTO } from "../../shared/testo";
import { cerca, type ConfigPubblica, inviaEvento, leggiSrc } from "../api";
import { oraRoma } from "../formato";
import { riduci, STATO_INIZIALE, type Messaggio } from "../stato";
import { ottieniToken } from "../turnstile";
import { BannerInstagram } from "./BannerInstagram";
import { Card, CardScheletro } from "./Card";
import { Footer } from "./Footer";
import { Idee } from "./Idee";

const ESEMPI = ["papà runner, 50 €", "amico segreto in ufficio, 15 €", "fidanzata che ama leggere, 30 €"];

const TESTI_MESSAGGIO: Record<Messaggio, string> = {
  non_capito: "🤔 Non ho capito per chi è il regalo. Prova così: “mio fratello, ama la montagna, 30 €”.",
  troppe_richieste: "⏳ Hai fatto molte ricerche di fila, riprova tra un minuto.",
  verifica_fallita: "🛡️ Verifica di sicurezza non riuscita. Ricarica la pagina e riprova.",
  errore: "⚠️ Qualcosa è andato storto. Riprova.",
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
    const token = await ottieniToken(turnstileRef.current!, config.turnstileSiteKey);
    await cerca({ testo: pulito, turnstileToken: token, src, escludi: altre ? stato.mostrati : [] }, (evento) => invia({ tipo: "evento", evento })).catch(() =>
      invia({ tipo: "evento", evento: { tipo: "errore" } }),
    );
    invia({ tipo: "fine" });
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
    setAvviso(perSe ? "Link copiato: incollalo dove vuoi e aprilo sul computer." : "Link copiato.");
  }

  const inHome = stato.fase === "home";
  const capito = stato.capito;
  const primoProdotto = stato.scelte[0]?.prodotto;

  return (
    <main class="pagina">
      <header class="logo">
        cosa<span>regalo</span>
      </header>
      <BannerInstagram />
      {inHome && <h1>Dimmi per chi è e quanto vuoi spendere. Ti dico cosa regalare.</h1>}
      <form
        class={inHome ? "form" : "form compatto"}
        onSubmit={(e) => {
          e.preventDefault();
          void avvia(testo, false);
        }}
      >
        <textarea
          value={testo}
          maxLength={300}
          rows={inHome ? 3 : 2}
          placeholder="Es. mia mamma, ama il giardinaggio, 40 €"
          onInput={(e) => setTesto((e.target as HTMLTextAreaElement).value)}
        />
        <button class="btn" type="submit" disabled={stato.fase === "cerca" || testo.trim().length < MIN_TESTO}>
          {stato.fase === "cerca" ? "Sto cercando…" : "Trova il regalo 🎁"}
        </button>
      </form>
      <div ref={turnstileRef} />
      {inHome && (
        <div class="esempi">
          <span>Oppure prova:</span>
          {ESEMPI.map((es) => (
            <button
              key={es}
              type="button"
              onClick={() => {
                setTesto(es);
                void avvia(es, false);
              }}
            >
              {es}
            </button>
          ))}
        </div>
      )}
      {capito && (
        <div class="chips">
          {capito.destinatario && <span>👤 {capito.destinatario}</span>}
          {capito.interessi.map((i) => (
            <span key={i}>{i}</span>
          ))}
          {capito.budgetMax && <span>≤ {capito.budgetMax} €</span>}
        </div>
      )}
      {stato.fase === "cerca" && capito && capito.ricerche.map((r) => <CardScheletro key={r} ricerca={r} />)}
      {stato.messaggio && <p class="messaggio">{TESTI_MESSAGGIO[stato.messaggio]}</p>}
      {stato.fase === "fatto" && stato.modalita && (
        <section>
          {stato.scelte.map((s) => (
            <Card key={s.asin} scelta={s} tag={config.affiliateTag} risultatoId={stato.id} src={src} />
          ))}
          {stato.modalita === "completa" && stato.idee.length > 0 && <p class="messaggio">🔍 Ho trovato poco con questo budget: ecco altre idee.</p>}
          <Idee idee={stato.idee} tag={config.affiliateTag} risultatoId={stato.id} src={src} />
          {primoProdotto && <p class="nota">Prezzi rilevati alle {oraRoma(primoProdotto.rilevatoIl)}, possono cambiare.</p>}
          <div class="azioni">
            {stato.id && (
              <>
                <button class="btn2" type="button" onClick={() => void condividi(false)}>
                  📤 Condividi
                </button>
                <button class="btn2" type="button" onClick={() => void condividi(true)}>
                  💻 Mandalo a te
                </button>
              </>
            )}
            <button class="btn2" type="button" onClick={() => void avvia(stato.testo, true)}>
              🔁 Altre idee
            </button>
          </div>
          {avviso && <p class="nota">{avviso}</p>}
        </section>
      )}
      <Footer />
    </main>
  );
}
