import { describe, expect, it } from "vitest";
import { testEnv } from "../../helpers/env";
import { prodotto } from "../../helpers/fake-source";
import { leggiRisultato, salvaRisultato } from "../../../src/worker/store/risultati";
import { chiaveRicerca, leggiCacheRicerca, leggiCacheRichiesta, scriviCacheRicerca, scriviCacheRichiesta } from "../../../src/worker/store/cache";
import { incrementa, leggiContatore } from "../../../src/worker/store/contatori";
import { registraEvento } from "../../../src/worker/store/eventi";
import { pulisci } from "../../../src/worker/store/pulizia";
import { sicuro } from "../../../src/worker/store/sicuro";
import type { Capito } from "../../../src/shared/types";

const db = () => testEnv().DB;
const ORA = new Date("2026-10-02T10:00:00.000Z");
const capito: Capito = { regalo: true, destinatario: "mamma", interessi: ["giardinaggio"], budgetMax: 40, occasione: null, ricerche: ["a", "b", "c"], titolo: "3 regali per la mamma" };

describe("risultati", () => {
  it("salva e rilegge un risultato con id breve", async () => {
    const scelte = [{ asin: "A000000001", perche: "bello", prodotto: prodotto("A000000001") }];
    const id = await salvaRisultato(db(), { creatoIl: ORA.toISOString(), titolo: capito.titolo, capito, scelte, idee: [], modalita: "completa", src: "bio" });
    expect(id).toMatch(/^[0-9A-Za-z]{8}$/);
    expect(await leggiRisultato(db(), id)).toEqual({ id, titolo: capito.titolo, creatoIl: ORA.toISOString(), capito, modalita: "completa", scelte, idee: [] });
  });
  it("restituisce null per id inesistente", async () => {
    expect(await leggiRisultato(db(), "ZZZZZZZZ")).toBeNull();
  });
});

describe("cache", () => {
  it("chiaveRicerca è uguale per varianti di maiuscole/punteggiatura e diversa per budget", async () => {
    expect(await chiaveRicerca("Set Attrezzi, Giardinaggio!", 40)).toBe(await chiaveRicerca("set attrezzi giardinaggio", 40));
    expect(await chiaveRicerca("set attrezzi giardinaggio", 50)).not.toBe(await chiaveRicerca("set attrezzi giardinaggio", 40));
  });
  it("la cache ricerche scade dopo 24 ore", async () => {
    const k = await chiaveRicerca("q", 40);
    await scriviCacheRicerca(db(), k, [prodotto("A000000001")], ORA);
    expect(await leggiCacheRicerca(db(), k, new Date(ORA.getTime() + 23 * 3600e3))).toHaveLength(1);
    expect(await leggiCacheRicerca(db(), k, new Date(ORA.getTime() + 25 * 3600e3))).toBeNull();
  });
  it("la cache richieste punta a un risultato e scade dopo 24 ore", async () => {
    const id = await salvaRisultato(db(), { creatoIl: ORA.toISOString(), titolo: "t", capito, scelte: [], idee: [], modalita: "completa", src: null });
    await scriviCacheRichiesta(db(), "hash1", id, ORA);
    expect(await leggiCacheRichiesta(db(), "hash1", ORA)).toBe(id);
    expect(await leggiCacheRichiesta(db(), "hash1", new Date(ORA.getTime() + 25 * 3600e3))).toBeNull();
  });
});

describe("contatori", () => {
  it("incrementa atomicamente e restituisce il nuovo valore", async () => {
    expect(await incrementa(db(), "2026-10-02", "globale")).toBe(1);
    expect(await incrementa(db(), "2026-10-02", "globale")).toBe(2);
    expect(await leggiContatore(db(), "2026-10-02", "globale")).toBe(2);
    expect(await leggiContatore(db(), "2026-10-03", "globale")).toBe(0);
  });
});

describe("eventi e pulizia", () => {
  it("pulisci cancella eventi > 90 giorni, cache scadute e contatori > 7 giorni", async () => {
    await registraEvento(db(), { tipo: "click", asin: "A000000001" }, new Date("2026-06-01T00:00:00Z"));
    await registraEvento(db(), { tipo: "click", asin: "A000000002" }, ORA);
    await incrementa(db(), "2026-09-20", "globale");
    await incrementa(db(), "2026-10-01", "globale");
    await scriviCacheRicerca(db(), "vecchia", [], new Date("2026-09-01T00:00:00Z"));
    await pulisci(db(), ORA);
    const eventi = await db().prepare("SELECT asin FROM eventi").all<{ asin: string }>();
    expect(eventi.results.map((e) => e.asin)).toEqual(["A000000002"]);
    expect(await leggiContatore(db(), "2026-09-20", "globale")).toBe(0);
    expect(await leggiContatore(db(), "2026-10-01", "globale")).toBe(1);
    expect(await db().prepare("SELECT COUNT(*) AS n FROM cache_ricerche WHERE chiave = 'vecchia'").first<{ n: number }>()).toEqual({ n: 0 });
  });
});

describe("sicuro", () => {
  it("restituisce null invece di propagare l'errore", async () => {
    expect(await sicuro(async () => { throw new Error("D1 giù"); })).toBeNull();
    expect(await sicuro(async () => 5)).toBe(5);
  });
});
