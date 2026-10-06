import { describe, expect, it } from "vitest";
import { giorniValidi, riepilogo, tabella, visiteDaGraphql } from "../../scripts/numeri-calcolo";

describe("giorniValidi", () => {
  it("default 7, accetta interi tra 1 e 365", () => {
    expect(giorniValidi(undefined)).toBe(7);
    expect(giorniValidi("30")).toBe(30);
  });

  it("rifiuta valori che finirebbero nella query", () => {
    expect(() => giorniValidi("7; DROP TABLE eventi")).toThrow();
    expect(() => giorniValidi("0")).toThrow();
    expect(() => giorniValidi("1000")).toThrow();
  });
});

describe("riepilogo", () => {
  const righe = [
    { src: null, tipo: "ricerca", n: 4 },
    { src: null, tipo: "click", n: 3 },
    { src: "ig", tipo: "ricerca", n: 10 },
    { src: "ig", tipo: "click", n: 4 },
    { src: "ig", tipo: "carrello", n: 1 },
    { src: "ig", tipo: "condivisione", n: 2 },
    { src: "ig", tipo: "blocco", n: 5 },
  ];

  it("un canale per src, senza src = diretto, ordinati per ricerche, totale in fondo", () => {
    const r = riepilogo(righe);
    expect(r.map((x) => x.canale)).toEqual(["ig", "diretto", "totale"]);
    expect(r[0]).toMatchObject({ ricerche: 10, click: 4, carrello: 1, condivisioni: 2 });
    expect(r[2]).toMatchObject({ ricerche: 14, click: 7, carrello: 1, condivisioni: 2 });
  });

  it("click per ricerca in percentuale, trattino se non ci sono ricerche", () => {
    const r = riepilogo([...righe, { src: "tg", tipo: "click", n: 1 }]);
    expect(r.find((x) => x.canale === "ig")!.clickPerRicerca).toBe("40%");
    expect(r.find((x) => x.canale === "tg")!.clickPerRicerca).toBe("–");
  });

  it("ignora i blocchi delle difese di spesa (non sono uso del sito)", () => {
    expect(riepilogo(righe).at(-1)).not.toHaveProperty("blocco");
  });
});

describe("visiteDaGraphql", () => {
  it("somma le visite e le raggruppa per provenienza", () => {
    const json = {
      data: {
        viewer: {
          accounts: [
            {
              rumPageloadEventsAdaptiveGroups: [
                { sum: { visits: 12 }, dimensions: { refererHost: "l.instagram.com" } },
                { sum: { visits: 5 }, dimensions: { refererHost: "" } },
                { sum: { visits: 3 }, dimensions: { refererHost: "www.google.com" } },
              ],
            },
          ],
        },
      },
      errors: null,
    };
    expect(visiteDaGraphql(json)).toEqual({
      totale: 20,
      perProvenienza: [
        { provenienza: "l.instagram.com", visite: 12 },
        { provenienza: "diretto", visite: 5 },
        { provenienza: "www.google.com", visite: 3 },
      ],
    });
  });

  it("errore leggibile se l'API risponde con errori", () => {
    expect(() => visiteDaGraphql({ data: null, errors: [{ message: "not authorized" }] })).toThrow(/not authorized/);
  });
});

describe("tabella", () => {
  it("mette le visite in testa quando ci sono, e spiega come attivarle quando mancano", () => {
    const r = riepilogo([{ src: "ig", tipo: "ricerca", n: 2 }]);
    expect(tabella(r, 7, { totale: 20, perProvenienza: [{ provenienza: "l.instagram.com", visite: 20 }] })).toMatch(/Visite: 20/);
    expect(tabella(r, 7, null)).toMatch(/docs\/statistiche\.md/);
  });
});
