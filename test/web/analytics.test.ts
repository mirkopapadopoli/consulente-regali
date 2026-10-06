import { describe, expect, it } from "vitest";
import { beaconAnalytics, primaVisita } from "../../src/web/analytics";

describe("beaconAnalytics", () => {
  it("nessuno script senza token: niente misurazione finché non è configurata", () => {
    expect(beaconAnalytics("")).toBeNull();
    expect(beaconAnalytics("   ")).toBeNull();
  });

  it("script Cloudflare Web Analytics con il token", () => {
    expect(beaconAnalytics("abc123")).toEqual({
      src: "https://static.cloudflareinsights.com/beacon.min.js",
      dati: '{"token":"abc123"}',
    });
  });
});

describe("primaVisita", () => {
  it("vera solo la prima volta nella sessione: i ricaricamenti non contano come nuove visite", () => {
    const mem = new Map<string, string>();
    const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    expect(primaVisita(storage)).toBe(true);
    expect(primaVisita(storage)).toBe(false);
  });

  it("storage inaccessibile (es. browser in-app restrittivi) → conta la visita", () => {
    const rotto = { getItem: () => { throw new Error("no"); }, setItem: () => { throw new Error("no"); } };
    expect(primaVisita(rotto)).toBe(true);
  });
});
