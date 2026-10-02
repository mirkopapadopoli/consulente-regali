import { describe, expect, it, vi } from "vitest";
import { fallbackScelte, MAX_PERCHE, scegli, tronca, validaScelte } from "../../../src/worker/ai/scegli";
import { ErroreAI } from "../../../src/worker/ai/openrouter";
import type { Candidato } from "../../../src/shared/types";
import { prodotto } from "../../helpers/fake-source";

const c = (asin: string, ricerca: number, stelle = 4.5, recensioni = 100): Candidato => ({ ...prodotto(asin, { stelle, recensioni }), ricerca });
const candidati = [c("A000000001", 0, 4.8, 94), c("A000000002", 0, 4.4, 512), c("A000000003", 1, 4.6, 692), c("A000000004", 2, 4.1, 30)];

describe("tronca", () => {
  it("lascia invariate le frasi brevi e tronca a parola quelle lunghe", () => {
    expect(tronca("breve")).toBe("breve");
    const t = tronca("parola ".repeat(40));
    expect(t.length).toBeLessThanOrEqual(MAX_PERCHE);
    expect(t.endsWith("…")).toBe(true);
  });
});

describe("validaScelte", () => {
  it("accetta 3 id distinti presenti tra i candidati", () => {
    const x = { scelte: [{ id: "A000000001", perche: "a" }, { id: "A000000003", perche: "b" }, { id: "A000000004", perche: "c" }] };
    expect(validaScelte(x, candidati, 3)).toEqual([
      { asin: "A000000001", perche: "a" }, { asin: "A000000003", perche: "b" }, { asin: "A000000004", perche: "c" },
    ]);
  });
  it("rifiuta id inventati, duplicati, perché vuoti o numero sbagliato", () => {
    expect(validaScelte({ scelte: [{ id: "INVENTATO1", perche: "a" }, { id: "A000000002", perche: "b" }, { id: "A000000003", perche: "c" }] }, candidati, 3)).toBeNull();
    expect(validaScelte({ scelte: [{ id: "A000000001", perche: "a" }, { id: "A000000001", perche: "b" }, { id: "A000000003", perche: "c" }] }, candidati, 3)).toBeNull();
    expect(validaScelte({ scelte: [{ id: "A000000001", perche: " " }, { id: "A000000002", perche: "b" }, { id: "A000000003", perche: "c" }] }, candidati, 3)).toBeNull();
    expect(validaScelte({ scelte: [{ id: "A000000001", perche: "a" }] }, candidati, 3)).toBeNull();
    expect(validaScelte("x", candidati, 3)).toBeNull();
  });
});

describe("fallbackScelte", () => {
  it("prende i migliori per voto × log(recensioni), preferendo ricerche diverse, senza perché", () => {
    const out = fallbackScelte(candidati, 3);
    expect(out.map((s) => s.asin)).toEqual(["A000000003", "A000000002", "A000000004"]);
    expect(out.every((s) => s.perche === null)).toBe(true);
  });
});

describe("scegli", () => {
  it("usa la risposta AI valida", async () => {
    const chat = vi.fn(async () => ({ scelte: [{ id: "A000000001", perche: "a" }, { id: "A000000002", perche: "b" }, { id: "A000000003", perche: "c" }] }));
    const r = await scegli("mamma giardinaggio", candidati, chat);
    expect(r.ai).toBe(true);
    expect(r.scelte.map((s) => s.asin)).toEqual(["A000000001", "A000000002", "A000000003"]);
    const [, user] = chat.mock.calls[0] as unknown as [string, string];
    expect(JSON.parse(user).prodotti[0]).toEqual({ id: "A000000001", titolo: "Prodotto A000000001", prezzo: 20, stelle: 4.8, recensioni: 94 });
  });
  it("ripiega sul fallback se l'AI fallisce o inventa", async () => {
    expect((await scegli("x", candidati, vi.fn().mockRejectedValue(new ErroreAI("t")))).ai).toBe(false);
    expect((await scegli("x", candidati, vi.fn(async () => ({ scelte: [] })))).scelte).toHaveLength(3);
  });
  it("chiede tante scelte quanti candidati se sono meno di 3, nessuna chiamata se 0", async () => {
    const chat = vi.fn(async () => ({ scelte: [{ id: "A000000001", perche: "a" }] }));
    expect((await scegli("x", candidati.slice(0, 1), chat)).scelte).toEqual([{ asin: "A000000001", perche: "a" }]);
    const vuota = vi.fn();
    expect(await scegli("x", [], vuota)).toEqual({ scelte: [], ai: false });
    expect(vuota).not.toHaveBeenCalled();
  });
});
