import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/worker/config";

describe("loadConfig", () => {
  it("usa i default della spec quando le variabili mancano", () => {
    const c = loadConfig({});
    expect(c).toMatchObject({
      aiModel: "deepseek/deepseek-v4.1-flash",
      aiTimeoutMs: 6000,
      apifyActor: "junglee~amazon-crawler",
      apifyPerRicerca: 5,
      apifyTimeoutMs: 20000,
      minStelle: 4,
      minRecensioni: 20,
      quotaVisitatore: 5,
      tettoGiornaliero: 150,
      affiliateTag: "mirkopapadopo-21",
      budgetDefault: 100,
    });
  });
  it("legge i valori dalle variabili e ignora quelli non numerici", () => {
    const c = loadConfig({ QUOTA_VISITATORE: "7", TETTO_GIORNALIERO: "abc", MIN_STELLE: " " });
    expect(c.quotaVisitatore).toBe(7);
    expect(c.tettoGiornaliero).toBe(150);
    expect(c.minStelle).toBe(4);
  });
});
