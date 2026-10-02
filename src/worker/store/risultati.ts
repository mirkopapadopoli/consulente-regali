import { idBreve } from "../../shared/testo";
import type { Capito, Idea, Modalita, RisultatoPubblico, SceltaConProdotto } from "../../shared/types";

export interface NuovoRisultato {
  creatoIl: string;
  titolo: string;
  capito: Capito;
  scelte: SceltaConProdotto[];
  idee: Idea[];
  modalita: Modalita;
  src: string | null;
}

export async function salvaRisultato(db: D1Database, r: NuovoRisultato): Promise<string> {
  for (let tentativo = 0; tentativo < 3; tentativo++) {
    const id = idBreve();
    const esito = await db
      .prepare(
        "INSERT OR IGNORE INTO risultati (id, creato_il, titolo, capito_json, contenuto_json, modalita, src) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      )
      .bind(id, r.creatoIl, r.titolo, JSON.stringify(r.capito), JSON.stringify({ scelte: r.scelte, idee: r.idee }), r.modalita, r.src)
      .run();
    if (esito.meta.changes === 1) return id;
  }
  throw new Error("salvaRisultato: collisione di id ripetuta");
}

export async function leggiRisultato(db: D1Database, id: string): Promise<RisultatoPubblico | null> {
  const riga = await db
    .prepare("SELECT id, creato_il, titolo, capito_json, contenuto_json, modalita FROM risultati WHERE id = ?1")
    .bind(id)
    .first<{ id: string; creato_il: string; titolo: string; capito_json: string; contenuto_json: string; modalita: Modalita }>();
  if (!riga) return null;
  const contenuto = JSON.parse(riga.contenuto_json) as { scelte: SceltaConProdotto[]; idee: Idea[] };
  return {
    id: riga.id,
    titolo: riga.titolo,
    creatoIl: riga.creato_il,
    capito: JSON.parse(riga.capito_json) as Capito,
    modalita: riga.modalita,
    scelte: contenuto.scelte,
    idee: contenuto.idee,
  };
}
