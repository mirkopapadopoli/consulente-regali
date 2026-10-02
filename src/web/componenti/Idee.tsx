import { linkRicerca } from "../../shared/affiliate";
import type { Idea } from "../../shared/types";
import { inviaEvento } from "../api";
import { NUMERALI } from "./Etichetta";
import { Icona } from "./Icona";

/** Idee senza prodotto: voci della timeline da completare su Amazon. */
export function Idee({ idee, tag, risultatoId, src }: { idee: Idea[]; tag: string; risultatoId: string | null; src: string | null }) {
  if (idee.length === 0) return null;
  return (
    <ol class="flusso flusso-idee">
      {idee.map((i, n) => (
        <li class="flusso-voce" key={i.ricerca}>
          <span class="flusso-tempo">Idea {NUMERALI[n] ?? n + 1}</span>
          <div class="flusso-card">
            <span class="flusso-titolo">{i.ricerca}</span>
            {i.perche ? <p class="perche perche-piccolo">{i.perche}</p> : null}
            <a class="pillola-contorno" href={linkRicerca(i.ricerca, tag)} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "click", risultatoId, src })}>
              <Icona nome="lente" /> Cerca su Amazon
            </a>
          </div>
        </li>
      ))}
    </ol>
  );
}
