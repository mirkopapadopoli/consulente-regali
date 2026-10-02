import type { Candidato, Prodotto } from "../../shared/types";

export interface OpzioniFiltro {
  budgetMax: number;
  minStelle: number;
  minRecensioni: number;
  escludi: ReadonlySet<string>;
}

/** Il listino conta solo se è sopra il prezzo e non più di 4 volte (spec §6.3). */
export function listinoPlausibile(prezzo: number, listino: number | null): number | null {
  return listino !== null && listino > prezzo && listino <= prezzo * 4 ? listino : null;
}

export function filtraCandidati(gruppi: Prodotto[][], o: OpzioniFiltro): Candidato[] {
  const visti = new Set<string>();
  const out: Candidato[] = [];
  gruppi.forEach((gruppo, ricerca) => {
    for (const p of gruppo) {
      if (visti.has(p.asin) || o.escludi.has(p.asin)) continue;
      if (!(p.prezzo > 0 && p.prezzo <= o.budgetMax)) continue;
      if (p.stelle < o.minStelle || p.recensioni < o.minRecensioni) continue;
      visti.add(p.asin);
      out.push({ ...p, prezzoListino: listinoPlausibile(p.prezzo, p.prezzoListino), ricerca });
    }
  });
  return out;
}
