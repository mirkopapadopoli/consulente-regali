import { linkRicerca } from "../../shared/affiliate";
import type { Idea } from "../../shared/types";
import { inviaEvento } from "../api";

export function Idee({ idee, tag, risultatoId, src }: { idee: Idea[]; tag: string; risultatoId: string | null; src: string | null }) {
  return (
    <>
      {idee.map((i) => (
        <article class="idea" key={i.ricerca}>
          <h3>💡 {i.ricerca}</h3>
          {i.perche && <p class="perche">“{i.perche}”</p>}
          <a class="btn2" href={linkRicerca(i.ricerca, tag)} target="_blank" rel="noopener sponsored" onClick={() => inviaEvento({ tipo: "click", risultatoId, src })}>
            Cerca su Amazon
          </a>
        </article>
      ))}
    </>
  );
}
