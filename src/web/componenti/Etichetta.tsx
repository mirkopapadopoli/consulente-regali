import type { Capito } from "../../shared/types";
import { dataRoma, oraRoma } from "../formato";

export const NUMERALI = ["01", "02", "03"];

const COLORI_PILLOLA = ["menta", "viola", "giallo", "bianco"];

/** Cosa ho capito: pillole colorate, una per dato estratto. */
export function Etichetta({ capito, titolo, rilevatoIl }: { capito: Capito; titolo?: string; rilevatoIl?: string }) {
  const righe: [string, string][] = [];
  if (capito.destinatario) righe.push(["Per", capito.destinatario]);
  if (capito.interessi.length) righe.push(["Ama", capito.interessi.join(", ")]);
  if (capito.budgetMax) righe.push(["Fino a", `${capito.budgetMax.toLocaleString("it-IT")} €`]);
  if (capito.occasione) righe.push(["Occasione", capito.occasione]);
  return (
    <section class="capito" aria-label="Cosa ho capito">
      {titolo ? <h1 class="titolo-condiviso">{titolo}</h1> : <p class="etichetta-mono">Ho capito</p>}
      <ul class="pillole">
        {righe.map(([campo, valore], i) => (
          <li class={`pillola pillola-${COLORI_PILLOLA[i % COLORI_PILLOLA.length]}`} key={campo} style={{ "--i": i }}>
            <span class="pillola-campo">{campo}</span>
            <span class="pillola-valore">{valore}</span>
          </li>
        ))}
      </ul>
      {rilevatoIl ? (
        <p class="etichetta-mono etichetta-tenue">
          Prezzi del {dataRoma(rilevatoIl)} · ore {oraRoma(rilevatoIl)}
        </p>
      ) : null}
    </section>
  );
}

/** La timeline delle tre ricerche in corso, sul binario verticale. */
export function Preparazioni({ ricerche }: { ricerche: string[] }) {
  return (
    <ol class="flusso" aria-live="polite">
      {ricerche.map((r, i) => (
        <li class="flusso-voce" key={r} style={{ "--i": i }}>
          <span class="flusso-tempo">Ricerca {NUMERALI[i]}</span>
          <div class="flusso-card">
            <span class="flusso-stato">
              <span class="punto" aria-hidden="true" />
              In corso
            </span>
            <span class="flusso-titolo">{r}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
