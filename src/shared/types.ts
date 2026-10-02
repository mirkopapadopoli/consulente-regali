export type Modalita = "completa" | "leggera";

export interface Capito {
  regalo: boolean;
  destinatario: string | null;
  interessi: string[];
  budgetMax: number | null;
  occasione: string | null;
  /** 3 ricerche Amazon quando regalo = true, vuoto altrimenti. */
  ricerche: string[];
  titolo: string;
}

export interface Prodotto {
  asin: string;
  titolo: string;
  immagine: string | null;
  prezzo: number;
  prezzoListino: number | null;
  stelle: number;
  recensioni: number;
  /** ISO 8601, quando il prezzo è stato rilevato. */
  rilevatoIl: string;
}

/** Prodotto candidato con l'indice della ricerca (0–2) che l'ha trovato. */
export interface Candidato extends Prodotto {
  ricerca: number;
}

export interface ProductSource {
  search(query: string, budgetMax: number, max: number): Promise<Prodotto[]>;
}

export interface Scelta {
  asin: string;
  /** ≤ 140 caratteri; null solo nel fallback deterministico. */
  perche: string | null;
}

export interface SceltaConProdotto extends Scelta {
  prodotto: Prodotto;
}

export interface Idea {
  ricerca: string;
  perche: string | null;
}

export type MotivoBlocco = "troppe_richieste" | "verifica_fallita";

export type EventoSSE =
  | { tipo: "capito"; capito: Capito }
  | { tipo: "non_capito" }
  | { tipo: "risultati"; modalita: "completa"; scelte: SceltaConProdotto[]; idee: Idea[] }
  | { tipo: "risultati"; modalita: "leggera"; idee: Idea[] }
  | { tipo: "salvato"; id: string }
  | { tipo: "bloccato"; motivo: MotivoBlocco }
  | { tipo: "errore" };

export interface RisultatoPubblico {
  id: string;
  titolo: string;
  creatoIl: string;
  capito: Capito;
  modalita: Modalita;
  scelte: SceltaConProdotto[];
  idee: Idea[];
}
