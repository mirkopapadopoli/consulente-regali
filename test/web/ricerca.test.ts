import { describe, expect, it, vi } from "vitest";
import { avviaRicercaSicura, ottieniTokenDa, type TurnstileApi } from "../../src/web/ricerca";

function finto(comportamento: (opz: Record<string, (...a: unknown[]) => void>) => void): TurnstileApi {
  return {
    render: (_el, opz) => {
      setTimeout(() => comportamento(opz as Record<string, (...a: unknown[]) => void>), 0);
      return "w1";
    },
    execute: () => {},
    remove: () => {},
  };
}

const el = {} as HTMLElement;

describe("ottieniTokenDa", () => {
  it("restituisce il token del callback", async () => {
    expect(await ottieniTokenDa(finto((o) => o.callback("tok")), el, "k", 1000)).toBe("tok");
  });
  it("timeout, scadenza o browser non supportato → stringa vuota", async () => {
    for (const cb of ["timeout-callback", "expired-callback", "unsupported-callback", "error-callback"]) {
      expect(await ottieniTokenDa(finto((o) => o[cb]()), el, "k", 1000)).toBe("");
    }
  });
  it("widget che non risponde mai → stringa vuota dopo il timeout", async () => {
    expect(await ottieniTokenDa(finto(() => {}), el, "k", 20)).toBe("");
  });
  it("render che lancia (es. sitekey vuota) → stringa vuota", async () => {
    const rotto: TurnstileApi = { render: () => { throw new Error("sitekey"); }, execute: () => {}, remove: () => {} };
    expect(await ottieniTokenDa(rotto, el, "", 1000)).toBe("");
  });
});

describe("avviaRicercaSicura", () => {
  it("chiama sempre fine, anche se ottenere il token lancia", async () => {
    const fine = vi.fn();
    const errore = vi.fn();
    await avviaRicercaSicura({ ottieniToken: async () => { throw new Error("x"); }, cerca: vi.fn(), errore, fine });
    expect(errore).toHaveBeenCalledOnce();
    expect(fine).toHaveBeenCalledOnce();
  });
  it("chiama sempre fine, anche se la ricerca lancia", async () => {
    const fine = vi.fn();
    const errore = vi.fn();
    await avviaRicercaSicura({ ottieniToken: async () => "t", cerca: async () => { throw new Error("rete"); }, errore, fine });
    expect([errore.mock.calls.length, fine.mock.calls.length]).toEqual([1, 1]);
  });
  it("percorso normale: passa il token alla ricerca e chiama fine", async () => {
    const cerca = vi.fn(async (_t: string) => {});
    const fine = vi.fn();
    await avviaRicercaSicura({ ottieniToken: async () => "t", cerca, errore: vi.fn(), fine });
    expect(cerca).toHaveBeenCalledWith("t");
    expect(fine).toHaveBeenCalledOnce();
  });
});
