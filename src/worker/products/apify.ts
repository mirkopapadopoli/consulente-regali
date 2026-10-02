import { ASIN_RE } from "../../shared/testo";
import type { Prodotto, ProductSource } from "../../shared/types";

export function urlRicercaAmazon(query: string, budgetMax: number): string {
  return `https://www.amazon.it/s?k=${encodeURIComponent(query)}&rh=p_36%3A-${Math.round(budgetMax * 100)}&language=it_IT`;
}

type Valore = { value?: unknown } | null | undefined;

function numero(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Item di junglee/amazon-crawler → Prodotto, oppure null se inutilizzabile. */
export function mappaItem(item: unknown, rilevatoIl: string): Prodotto | null {
  if (typeof item !== "object" || item === null) return null;
  const it = item as Record<string, unknown>;
  const asin = typeof it.asin === "string" ? it.asin : "";
  const titolo = typeof it.title === "string" ? it.title.trim() : "";
  const prezzo = numero((it.price as Valore)?.value);
  if (!ASIN_RE.test(asin) || !titolo || prezzo === null) return null;
  return {
    asin,
    titolo: titolo.slice(0, 200),
    immagine: typeof it.imageUrl === "string" ? it.imageUrl : null,
    prezzo,
    prezzoListino: numero((it.getPriceBeforeDiscount as Valore)?.value),
    stelle: numero(it.stars) ?? 0,
    recensioni: Math.trunc(numero(it.reviewsCount) ?? 0),
    rilevatoIl,
  };
}

export interface OpzioniApify {
  token: string;
  actor: string;
  timeoutMs: number;
  fetch?: typeof fetch;
  now?: () => Date;
}

export class ApifySource implements ProductSource {
  constructor(private o: OpzioniApify) {}

  async search(query: string, budgetMax: number, max: number): Promise<Prodotto[]> {
    const f = this.o.fetch ?? ((i: RequestInfo | URL, init?: RequestInit) => fetch(i, init));
    const secondi = Math.ceil(this.o.timeoutMs / 1000);
    const res = await f(`https://api.apify.com/v2/acts/${this.o.actor}/run-sync-get-dataset-items?timeout=${secondi}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.o.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryOrProductUrls: [{ url: urlRicercaAmazon(query, budgetMax) }],
        maxItemsPerStartUrl: max,
        maxSearchPagesPerStartUrl: 1,
        scrapeProductDetails: false,
        proxyCountry: "IT",
      }),
      signal: AbortSignal.timeout(this.o.timeoutMs),
    });
    if (!res.ok) throw new Error(`Apify HTTP ${res.status}`);
    const items: unknown = await res.json();
    if (!Array.isArray(items)) throw new Error("Apify: la risposta non è un array");
    const quando = (this.o.now?.() ?? new Date()).toISOString();
    return items
      .map((i) => mappaItem(i, quando))
      .filter((p): p is Prodotto => p !== null)
      .slice(0, max);
  }
}
