import type { Capito } from "../../shared/types";

export const NUMERALI = ["I", "II", "III"];

/** L'etichetta compilata: i campi si scrivono uno alla volta mentre il consulente prepara. */
export function Etichetta({ capito, titolo }: { capito: Capito; titolo?: string }) {
  const righe: [string, string][] = [];
  if (capito.destinatario) righe.push(["Per", capito.destinatario]);
  if (capito.interessi.length) righe.push(["Ama", capito.interessi.join(", ")]);
  if (capito.budgetMax) righe.push(["Fino a", `${capito.budgetMax.toLocaleString("it-IT")} €`]);
  if (capito.occasione) righe.push(["Occasione", capito.occasione]);
  return (
    <section class="etichetta etichetta-compilata" aria-label="Cosa ho capito">
      <div class="etichetta-cornice">
        {titolo && <h1 class="etichetta-titolo">{titolo}</h1>}
        <dl class="etichetta-campi">
          {righe.map(([campo, valore], i) => (
            <div class="campo" key={campo} style={{ "--i": i }}>
              <dt>{campo}</dt>
              <dd>{valore}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Le tre preparazioni in corso: una riga per ricerca, numerate come in officina. */
export function Preparazioni({ ricerche }: { ricerche: string[] }) {
  return (
    <ol class="preparazioni" aria-live="polite">
      {ricerche.map((r, i) => (
        <li class="preparazione" key={r} style={{ "--i": i }}>
          <span class="numerale">{NUMERALI[i]}</span>
          <span class="preparazione-nome">{r}</span>
          <span class="stato-segno">in preparazione</span>
        </li>
      ))}
    </ol>
  );
}
