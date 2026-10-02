import { describe, expect, it } from "vitest";
import { filtraCandidati, listinoPlausibile } from "../../../src/worker/products/filtri";
import type { Prodotto } from "../../../src/shared/types";

function p(asin: string, extra: Partial<Prodotto> = {}): Prodotto {
  return {
    asin, titolo: `Prodotto ${asin}`, immagine: null, prezzo: 20, prezzoListino: null,
    stelle: 4.5, recensioni: 100, rilevatoIl: "2026-10-02T10:00:00.000Z", ...extra,
  };
}

const opz = { budgetMax: 40, minStelle: 4, minRecensioni: 20, escludi: new Set<string>() };

describe("listinoPlausibile", () => {
  it("tiene un listino maggiore del prezzo e non oltre 4 volte", () => {
    expect(listinoPlausibile(20, 30)).toBe(30);
    expect(listinoPlausibile(20, 80)).toBe(80);
  });
  it("scarta listini assenti, uguali, minori o assurdi", () => {
    expect(listinoPlausibile(20, null)).toBeNull();
    expect(listinoPlausibile(20, 20)).toBeNull();
    expect(listinoPlausibile(20, 15)).toBeNull();
    expect(listinoPlausibile(20, 1228517.9)).toBeNull();
  });
});

describe("filtraCandidati", () => {
  it("scarta prezzo oltre budget, prezzi assurdi o non positivi", () => {
    const out = filtraCandidati([[p("A000000001", { prezzo: 41 }), p("A000000002", { prezzo: 1597122.85 }), p("A000000003", { prezzo: 0 }), p("A000000004")]], opz);
    expect(out.map((c) => c.asin)).toEqual(["A000000004"]);
  });
  it("scarta voto o recensioni sotto soglia", () => {
    const out = filtraCandidati([[p("A000000001", { stelle: 3.9 }), p("A000000002", { recensioni: 6 }), p("A000000003")]], opz);
    expect(out.map((c) => c.asin)).toEqual(["A000000003"]);
  });
  it("deduplica tra ricerche diverse e ricorda la ricerca d'origine", () => {
    const out = filtraCandidati([[p("A000000001")], [p("A000000001"), p("A000000002")], []], opz);
    expect(out.map((c) => [c.asin, c.ricerca])).toEqual([["A000000001", 0], ["A000000002", 1]]);
  });
  it("esclude gli ASIN già mostrati (Altre idee)", () => {
    const out = filtraCandidati([[p("A000000001"), p("A000000002")]], { ...opz, escludi: new Set(["A000000001"]) });
    expect(out.map((c) => c.asin)).toEqual(["A000000002"]);
  });
  it("normalizza il prezzo di listino non plausibile a null", () => {
    const [c] = filtraCandidati([[p("A000000001", { prezzoListino: 1228517.9 })]], opz);
    expect(c.prezzoListino).toBeNull();
  });
});
