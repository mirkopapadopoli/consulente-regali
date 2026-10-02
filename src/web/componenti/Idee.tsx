import { linkRicerca } from "../../shared/affiliate";
import type { Idea } from "../../shared/types";
import { inviaEvento } from "../api";
import { NUMERALI } from "./Etichetta";
import { Icona } from "./Icona";

/** Idee senza prodotto: righe d'etichetta da completare su Amazon. */
export function Idee({ idee, tag, risultatoId, src }: { idee: Idea[]; tag: string; risultatoId: string | null; src: string | null }) {
  if (idee.length === 0) return null;
  return (
    <ul class="idee">
      {idee.map((i, n) => (
        <li class="idea" key={i.ricerca}>
          <span class="numerale">{NUMERALI[n] ?? n + 1}</span>
          <div>
            <p class="idea-nome">{i.ricerca}</p>
            {i.perche ? <p class="perche perche-piccolo">{i.perche}</p> : null}
          </div>
          <a class="pulsante pulsante-filetto" href={linkRicerca(i.ricerca, tag)} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "click", risultatoId, src })}>
            <Icona nome="lente" /> Cerca su Amazon
          </a>
        </li>
      ))}
    </ul>
  );
}
