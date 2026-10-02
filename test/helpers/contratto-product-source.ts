import { describe, expect, it } from "vitest";
import type { ProductSource } from "../../src/shared/types";

/** Ogni adattatore ProductSource (Apify oggi, Creators API domani) deve superarla. */
export function contrattoProductSource(nome: string, crea: () => ProductSource): void {
  describe(`contratto ProductSource: ${nome}`, () => {
    it("restituisce prodotti con campi validi e al massimo `max` elementi", async () => {
      const out = await crea().search("set attrezzi giardinaggio", 40, 5);
      expect(Array.isArray(out)).toBe(true);
      expect(out.length).toBeLessThanOrEqual(5);
      for (const p of out) {
        expect(p.asin).toMatch(/^[A-Z0-9]{10}$/);
        expect(typeof p.titolo).toBe("string");
        expect(Number.isFinite(p.prezzo)).toBe(true);
        expect(Number.isFinite(p.stelle)).toBe(true);
        expect(Number.isInteger(p.recensioni)).toBe(true);
        expect(Number.isNaN(Date.parse(p.rilevatoIl))).toBe(false);
      }
    });
  });
}
