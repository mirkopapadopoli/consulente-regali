import type { Capito, EventoSSE, Idea, Modalita, SceltaConProdotto } from "../shared/types";

export type Fase = "home" | "cerca" | "fatto";
export type Messaggio = "non_capito" | "troppe_richieste" | "verifica_fallita" | "errore";

export interface Stato {
  fase: Fase;
  testo: string;
  capito: Capito | null;
  modalita: Modalita | null;
  scelte: SceltaConProdotto[];
  idee: Idea[];
  id: string | null;
  messaggio: Messaggio | null;
  mostrati: string[];
}

export type Azione =
  | { tipo: "avvia"; testo: string; altre: boolean }
  | { tipo: "evento"; evento: EventoSSE }
  | { tipo: "fine" }
  | { tipo: "reset" };

export const STATO_INIZIALE: Stato = {
  fase: "home", testo: "", capito: null, modalita: null, scelte: [], idee: [], id: null, messaggio: null, mostrati: [],
};

export function riduci(s: Stato, a: Azione): Stato {
  switch (a.tipo) {
    case "reset":
      return STATO_INIZIALE;
    case "avvia":
      return {
        ...STATO_INIZIALE,
        fase: "cerca",
        testo: a.testo,
        capito: a.altre ? s.capito : null,
        mostrati: a.altre ? s.mostrati : [],
      };
    case "fine":
      return s.fase === "cerca" ? { ...s, fase: "fatto", messaggio: s.messaggio ?? "errore" } : s;
    case "evento": {
      const e = a.evento;
      switch (e.tipo) {
        case "capito":
          return { ...s, capito: e.capito };
        case "non_capito":
          return { ...s, fase: "fatto", messaggio: "non_capito" };
        case "bloccato":
          return { ...s, fase: "fatto", messaggio: e.motivo };
        case "errore":
          return { ...s, fase: "fatto", messaggio: "errore" };
        case "salvato":
          return { ...s, id: e.id };
        case "risultati": {
          const scelte = e.modalita === "completa" ? e.scelte : [];
          return {
            ...s,
            fase: "fatto",
            modalita: e.modalita,
            scelte,
            idee: e.idee,
            mostrati: [...s.mostrati, ...scelte.map((x) => x.asin)],
          };
        }
      }
    }
  }
}
