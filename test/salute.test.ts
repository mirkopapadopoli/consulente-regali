import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { testEnv } from "./helpers/env";

describe("scaffolding", () => {
  it("risponde su /api/salute", async () => {
    const res = await exports.default.fetch("http://localhost/api/salute");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("ha creato le tabelle D1 della spec", async () => {
    const { results } = await testEnv()
      .DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all<{ name: string }>();
    const nomi = results.map((r) => r.name);
    for (const t of ["risultati", "cache_ricerche", "cache_richieste", "contatori", "eventi"]) {
      expect(nomi).toContain(t);
    }
  });
});
