import { describe, expect, it, vi } from "vitest";
import { capire, PROMPT_CAPIRE, validaCapito } from "../../../src/worker/ai/capire";
import { ErroreAI } from "../../../src/worker/ai/openrouter";

const buono = {
  regalo: true, destinatario: "mamma", interessi: ["giardinaggio", "piante"], budget_max_euro: 40,
  occasione: null, ricerche: ["set attrezzi giardinaggio", "vaso design piante", "kit semi aromatiche"],
  titolo: "3 regali per una mamma che ama il giardinaggio",
};

describe("validaCapito", () => {
  it("mappa la risposta del modello nel contratto Capito", () => {
    expect(validaCapito(buono)).toEqual({
      regalo: true, destinatario: "mamma", interessi: ["giardinaggio", "piante"], budgetMax: 40,
      occasione: null, ricerche: ["set attrezzi giardinaggio", "vaso design piante", "kit semi aromatiche"],
      titolo: "3 regali per una mamma che ama il giardinaggio",
    });
  });
  it("accetta budget come stringa numerica e scarta budget non positivi", () => {
    expect(validaCapito({ ...buono, budget_max_euro: "35" })?.budgetMax).toBe(35);
    expect(validaCapito({ ...buono, budget_max_euro: 0 })?.budgetMax).toBeNull();
    expect(validaCapito({ ...buono, budget_max_euro: "tanti" })?.budgetMax).toBeNull();
  });
  it("tiene al massimo 3 interessi e 3 ricerche, ripulite", () => {
    const c = validaCapito({ ...buono, interessi: ["a", "b", "c", "d"], ricerche: [" uno ", "due", "tre", "quattro"] });
    expect(c?.interessi).toEqual(["a", "b", "c"]);
    expect(c?.ricerche).toEqual(["uno", "due", "tre"]);
  });
  it("rifiuta una richiesta regalo con meno di 3 ricerche valide", () => {
    expect(validaCapito({ ...buono, ricerche: ["uno", ""] })).toBeNull();
  });
  it("accetta regalo=false anche con gli altri campi vuoti", () => {
    expect(validaCapito({ regalo: false })).toMatchObject({ regalo: false, ricerche: [] });
  });
  it("usa un titolo di riserva se manca", () => {
    expect(validaCapito({ ...buono, titolo: "" })?.titolo).toBe("3 idee regalo");
  });
  it("rifiuta input non oggetto o senza campo regalo booleano", () => {
    expect(validaCapito(null)).toBeNull();
    expect(validaCapito({ ...buono, regalo: "sì" })).toBeNull();
  });
});

describe("capire", () => {
  it("passa il prompt e il testo al modello", async () => {
    const chat = vi.fn(async () => buono);
    await capire("mia mamma, giardinaggio, 40 €", chat);
    expect(chat).toHaveBeenCalledWith(PROMPT_CAPIRE, "mia mamma, giardinaggio, 40 €");
  });
  it("riprova una volta se la prima risposta non è valida", async () => {
    const chat = vi.fn().mockResolvedValueOnce({ foo: 1 }).mockResolvedValueOnce(buono);
    expect((await capire("x", chat)).budgetMax).toBe(40);
    expect(chat).toHaveBeenCalledTimes(2);
  });
  it("lancia ErroreAI dopo due fallimenti", async () => {
    const chat = vi.fn().mockRejectedValue(new ErroreAI("timeout"));
    await expect(capire("x", chat)).rejects.toBeInstanceOf(ErroreAI);
    expect(chat).toHaveBeenCalledTimes(2);
  });
});
