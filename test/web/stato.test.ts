import { describe, expect, it } from "vitest";
import { riduci, STATO_INIZIALE, type Stato } from "../../src/web/stato";
import type { Capito, EventoSSE } from "../../src/shared/types";
import { prodotto } from "../helpers/fake-source";

const capito: Capito = { regalo: true, destinatario: "mamma", interessi: [], budgetMax: 40, occasione: null, ricerche: ["a", "b", "c"], titolo: "t" };
const ev = (s: Stato, e: EventoSSE) => riduci(s, { tipo: "evento", evento: e });

describe("riduci", () => {
  it("avvia → cerca, capito → etichette, risultati → fatto con ASIN mostrati, salvato → id", () => {
    let s = riduci(STATO_INIZIALE, { tipo: "avvia", testo: "mamma 40", altre: false });
    expect(s.fase).toBe("cerca");
    s = ev(s, { tipo: "capito", capito });
    expect(s.capito).toEqual(capito);
    s = ev(s, { tipo: "risultati", modalita: "completa", scelte: [{ asin: "A000000001", perche: "x", prodotto: prodotto("A000000001") }], idee: [] });
    expect([s.fase, s.modalita, s.mostrati]).toEqual(["fatto", "completa", ["A000000001"]]);
    s = ev(s, { tipo: "salvato", id: "AbCdEf12" });
    expect(s.id).toBe("AbCdEf12");
  });
  it("Altre idee conserva gli ASIN già mostrati, una nuova ricerca li azzera", () => {
    const pieno = { ...STATO_INIZIALE, mostrati: ["A000000001"], capito };
    expect(riduci(pieno, { tipo: "avvia", testo: "x", altre: true }).mostrati).toEqual(["A000000001"]);
    expect(riduci(pieno, { tipo: "avvia", testo: "x", altre: false }).mostrati).toEqual([]);
  });
  it("non_capito, bloccato ed errore chiudono la ricerca con un messaggio", () => {
    const cerca = riduci(STATO_INIZIALE, { tipo: "avvia", testo: "x", altre: false });
    expect(ev(cerca, { tipo: "non_capito" })).toMatchObject({ fase: "fatto", messaggio: "non_capito" });
    expect(ev(cerca, { tipo: "bloccato", motivo: "troppe_richieste" })).toMatchObject({ fase: "fatto", messaggio: "troppe_richieste" });
    expect(ev(cerca, { tipo: "errore" })).toMatchObject({ fase: "fatto", messaggio: "errore" });
  });
  it("stream chiuso senza risultati → errore; dopo i risultati non cambia nulla", () => {
    const cerca = riduci(STATO_INIZIALE, { tipo: "avvia", testo: "x", altre: false });
    expect(riduci(cerca, { tipo: "fine" })).toMatchObject({ fase: "fatto", messaggio: "errore" });
    const fatto = ev(cerca, { tipo: "risultati", modalita: "leggera", idee: [] });
    expect(riduci(fatto, { tipo: "fine" })).toEqual(fatto);
  });
});
