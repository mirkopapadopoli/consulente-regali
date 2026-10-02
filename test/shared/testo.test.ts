import { describe, expect, it } from "vitest";
import { giornoRoma, idBreve, ID_RE, MAX_TESTO, normalizza, pulisciTesto, sha256Hex } from "../../src/shared/testo";

describe("pulisciTesto", () => {
  it("rimuove URL ed email e compatta gli spazi", () => {
    expect(pulisciTesto("  mia mamma https://x.it/a  scrivi a a@b.it   40 €  ")).toBe("mia mamma scrivi a 40 €");
  });
  it("tronca a 300 caratteri", () => {
    expect(pulisciTesto("a".repeat(500))).toHaveLength(MAX_TESTO);
  });
  it("restituisce stringa vuota per solo spazi", () => {
    expect(pulisciTesto("   \n\t ")).toBe("");
  });
});

describe("normalizza", () => {
  it("rende equivalenti varianti di maiuscole, punteggiatura ed emoji", () => {
    expect(normalizza("Mia MAMMA, ama il giardinaggio!! 🌱 40€")).toBe(normalizza("mia mamma ama il giardinaggio 40€"));
  });
  it("mantiene accenti, cifre e simbolo euro", () => {
    expect(normalizza("Macinacaffè 30 €")).toBe("macinacaffè 30 €");
  });
});

describe("giornoRoma", () => {
  it("usa la mezzanotte di Roma, non di UTC (ora legale)", () => {
    expect(giornoRoma(new Date("2026-10-02T21:59:00Z"))).toBe("2026-10-02");
    expect(giornoRoma(new Date("2026-10-02T22:01:00Z"))).toBe("2026-10-03");
  });
  it("usa la mezzanotte di Roma anche in inverno", () => {
    expect(giornoRoma(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
  });
});

describe("sha256Hex e idBreve", () => {
  it("sha256Hex è deterministico ed esadecimale", async () => {
    const a = await sha256Hex("ciao");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await sha256Hex("ciao")).toBe(a);
  });
  it("idBreve produce 8 caratteri base62", () => {
    for (let i = 0; i < 50; i++) expect(idBreve()).toMatch(ID_RE);
  });
});
