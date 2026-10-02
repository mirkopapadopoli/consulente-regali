import { describe, expect, it, vi } from "vitest";
import fixture from "../../fixtures/apify-giardinaggio.json";
import { ApifySource, mappaItem, urlRicercaAmazon } from "../../../src/worker/products/apify";
import { contrattoProductSource } from "../../helpers/contratto-product-source";
import { FakeSource, prodotto } from "../../helpers/fake-source";

const ORA = new Date("2026-10-02T10:42:00.000Z");

function fetchFinto(risposta: unknown, status = 200) {
  return vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify(risposta), { status }));
}

describe("urlRicercaAmazon", () => {
  it("costruisce la ricerca amazon.it con tetto prezzo in centesimi e lingua italiana", () => {
    const u = new URL(urlRicercaAmazon("kit giardinaggio", 40));
    expect(u.origin + u.pathname).toBe("https://www.amazon.it/s");
    expect(u.searchParams.get("k")).toBe("kit giardinaggio");
    expect(u.searchParams.get("rh")).toBe("p_36:-4000");
    expect(u.searchParams.get("language")).toBe("it_IT");
  });
});

describe("mappaItem", () => {
  it("mappa un item junglee completo", () => {
    expect(mappaItem(fixture[1], ORA.toISOString())).toEqual({
      asin: "B0C1SAWANS", titolo: "SAWANS Guanti da giardinaggio lunghi per donna",
      immagine: "https://m.media-amazon.com/images/I/61sawans.jpg", prezzo: 12.99, prezzoListino: 16.99,
      stelle: 4.4, recensioni: 512, rilevatoIl: ORA.toISOString(),
    });
  });
  it("scarta item senza prezzo o con ASIN malformato, mette 0 se mancano voto e recensioni", () => {
    expect(mappaItem(fixture[3], ORA.toISOString())).toBeNull();
    expect(mappaItem(fixture[4], ORA.toISOString())).toBeNull();
    expect(mappaItem(fixture[5], ORA.toISOString())).toMatchObject({ stelle: 0, recensioni: 0, immagine: null });
  });
  it("non lancia su input non oggetto", () => {
    expect(mappaItem(null, ORA.toISOString())).toBeNull();
    expect(mappaItem("x", ORA.toISOString())).toBeNull();
  });
});

describe("ApifySource", () => {
  it("chiama run-sync-get-dataset-items con l'input concordato", async () => {
    const f = fetchFinto(fixture);
    const src = new ApifySource({ token: "tok", actor: "junglee~amazon-crawler", timeoutMs: 20000, fetch: f, now: () => ORA });
    const out = await src.search("kit giardinaggio", 40, 5);
    const [url, init] = f.mock.calls[0];
    expect(String(url)).toBe("https://api.apify.com/v2/acts/junglee~amazon-crawler/run-sync-get-dataset-items?timeout=20");
    expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(JSON.parse(String(init!.body))).toEqual({
      categoryOrProductUrls: [{ url: urlRicercaAmazon("kit giardinaggio", 40) }],
      maxItemsPerStartUrl: 5, maxSearchPagesPerStartUrl: 1, scrapeProductDetails: false, proxyCountry: "IT",
    });
    expect(out.map((p) => p.asin)).toEqual(["B0D9K2YV5Q", "B0C1SAWANS", "B0CULTIVEA", "B0NOSTARS1"]);
  });
  it("lancia su risposta HTTP non ok o non array", async () => {
    await expect(new ApifySource({ token: "t", actor: "a", timeoutMs: 1000, fetch: fetchFinto({ error: "x" }, 402) }).search("q", 10, 5)).rejects.toThrow();
    await expect(new ApifySource({ token: "t", actor: "a", timeoutMs: 1000, fetch: fetchFinto({ not: "array" }) }).search("q", 10, 5)).rejects.toThrow();
  });
});

contrattoProductSource("ApifySource", () => new ApifySource({ token: "t", actor: "a", timeoutMs: 1000, fetch: fetchFinto(fixture.slice(0, 2)) }));
contrattoProductSource("FakeSource", () => new FakeSource({ "set attrezzi giardinaggio": [prodotto("A000000001")] }));
