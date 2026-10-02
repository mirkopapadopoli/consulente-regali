import { exports } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/apify-giardinaggio.json";
import { mockFetch } from "../helpers/mock-fetch";
import { leggiEventi } from "../helpers/sse";
import { testEnv } from "../helpers/env";

const CAPITO_AI = {
  regalo: true, destinatario: "mamma", interessi: ["giardinaggio"], budget_max_euro: 40, occasione: null,
  ricerche: ["set attrezzi giardinaggio", "guanti giardinaggio donna", "kit semi aromatiche"], titolo: "3 regali per una mamma",
};

function servizi(opz: { turnstile?: boolean } = {}) {
  return mockFetch(async (url, init) => {
    if (url.startsWith("https://challenges.cloudflare.com/")) return Response.json({ success: opz.turnstile ?? true });
    if (url.startsWith("https://openrouter.ai/")) {
      const body = JSON.parse(String(init!.body));
      const primo = String(body.messages[0].content).includes("primo passo");
      const content = primo
        ? JSON.stringify(CAPITO_AI)
        : JSON.stringify({ scelte: [{ id: "B0D9K2YV5Q", perche: "Per chi passa ore tra le piante" }, { id: "B0C1SAWANS", perche: "A prova di spine" }] });
      return Response.json({ choices: [{ message: { content } }] });
    }
    if (url.startsWith("https://api.apify.com/")) return Response.json(fixture);
    if (url.startsWith("https://api.telegram.org/")) return Response.json({ ok: true });
    throw new Error(`fetch inatteso: ${url}`);
  });
}

function cerca(body: unknown, headers: Record<string, string> = {}) {
  return exports.default.fetch("http://localhost/api/cerca", {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers },
    body: JSON.stringify(body),
  });
}

afterEach(() => vi.restoreAllMocks());

describe("POST /api/cerca", () => {
  it("testo troppo corto (anche dopo la pulizia) → 400 senza chiamate esterne", async () => {
    const f = servizi();
    const res = await cerca({ testo: "  https://x.it  ", turnstileToken: "t" });
    expect(res.status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });

  it("percorso completo in SSE e cookie visitatore impostato", async () => {
    servizi();
    const res = await cerca({ testo: "mia mamma, ama il giardinaggio, 40 euro", turnstileToken: "t", src: "bio" });
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("set-cookie")).toMatch(/cr_vid=/);
    const ev = await leggiEventi(res);
    expect(ev.map((e) => e.tipo)).toEqual(["capito", "risultati", "salvato"]);
    const ris = ev[1] as Extract<typeof ev[number], { tipo: "risultati"; modalita: "completa" }>;
    expect(ris.modalita).toBe("completa");
    expect(ris.scelte.map((s) => s.asin)).toEqual(["B0D9K2YV5Q", "B0C1SAWANS"]);
  });

  it("token Turnstile rifiutato → evento bloccato, nessuna AI", async () => {
    const f = servizi({ turnstile: false });
    const ev = await leggiEventi(await cerca({ testo: "papà runner 50 euro", turnstileToken: "falso" }));
    expect(ev).toEqual([{ tipo: "bloccato", motivo: "verifica_fallita" }]);
    expect(f.mock.calls.some(([u]) => String(u).includes("openrouter"))).toBe(false);
  });

  it("riusa un cookie visitatore valido senza reimpostarlo", async () => {
    servizi();
    const res = await cerca({ testo: "amico segreto 15 euro", turnstileToken: "t" }, { cookie: "cr_vid=abcdefghij-123" });
    expect(res.headers.get("set-cookie")).toBeNull();
    await res.text();
  });
});

describe("GET /api/risultati/:id", () => {
  it("restituisce un risultato salvato", async () => {
    servizi();
    const ev = await leggiEventi(await cerca({ testo: "fidanzata che legge 30 euro", turnstileToken: "t" }));
    const id = (ev.find((e) => e.tipo === "salvato") as { id: string }).id;
    const res = await exports.default.fetch(`http://localhost/api/risultati/${id}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id, titolo: "3 regali per una mamma", modalita: "completa" });
  });

  it("id malformato e inesistente → 404", async () => {
    for (const id of ["abc", "..%2F..%2Fetc", "ZZZZZZZZ"]) {
      const res = await exports.default.fetch(`http://localhost/api/risultati/${id}`);
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ errore: "non_trovato" });
    }
  });
});

describe("POST /api/evento", () => {
  it("registra un click valido", async () => {
    const res = await exports.default.fetch("http://localhost/api/evento", {
      method: "POST",
      body: JSON.stringify({ tipo: "click", asin: "B0D9K2YV5Q", risultatoId: "AbCdEf12", src: "bio" }),
    });
    expect(res.status).toBe(204);
    const r = await testEnv().DB.prepare("SELECT tipo, asin, src FROM eventi WHERE asin = 'B0D9K2YV5Q' AND tipo = 'click'").first();
    expect(r).toEqual({ tipo: "click", asin: "B0D9K2YV5Q", src: "bio" });
  });

  it("limita gli eventi per IP: una raffica riceve 429 e non scrive su D1", async () => {
    const stati: number[] = [];
    for (let i = 0; i < 25; i++) {
      const res = await exports.default.fetch("http://localhost/api/evento", {
        method: "POST",
        headers: { "cf-connecting-ip": "203.0.113.7" },
        body: JSON.stringify({ tipo: "condivisione" }),
      });
      stati.push(res.status);
    }
    expect(stati.filter((s) => s === 204)).toHaveLength(20);
    expect(stati.slice(20).every((s) => s === 429)).toBe(true);
  });

  it("rifiuta tipi non ammessi, ASIN malformati e body non JSON", async () => {
    for (const body of [JSON.stringify({ tipo: "blocco" }), JSON.stringify({ tipo: "click", asin: "x" }), "non json"]) {
      const res = await exports.default.fetch("http://localhost/api/evento", { method: "POST", body });
      expect(res.status).toBe(400);
    }
  });
});

describe("GET /api/config", () => {
  it("espone sitekey Turnstile e tag affiliato", async () => {
    const res = await exports.default.fetch("http://localhost/api/config");
    expect(await res.json()).toEqual({ turnstileSiteKey: "1x00000000000000000000AA", affiliateTag: "mirkopapadopo-21" });
  });
});
