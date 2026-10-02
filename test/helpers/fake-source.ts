import type { Prodotto, ProductSource } from "../../src/shared/types";

export function prodotto(asin: string, extra: Partial<Prodotto> = {}): Prodotto {
  return {
    asin, titolo: `Prodotto ${asin}`, immagine: null, prezzo: 20, prezzoListino: null,
    stelle: 4.5, recensioni: 100, rilevatoIl: "2026-10-02T10:00:00.000Z", ...extra,
  };
}

export class FakeSource implements ProductSource {
  chiamate: { query: string; budgetMax: number; max: number }[] = [];
  constructor(private perQuery: Record<string, Prodotto[] | Error> = {}) {}
  async search(query: string, budgetMax: number, max: number): Promise<Prodotto[]> {
    this.chiamate.push({ query, budgetMax, max });
    const r = this.perQuery[query] ?? [];
    if (r instanceof Error) throw r;
    return r.slice(0, max);
  }
}
