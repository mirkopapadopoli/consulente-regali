import { describe, expect, it, vi } from "vitest";
import { testEnv } from "../../helpers/env";
import { loadConfig } from "../../../src/worker/config";
import type { ContestoGuard } from "../../../src/worker/guard/tipi";
import { checkAccesso, checkSpesa } from "../../../src/worker/guard/index";
import { verificaTurnstile } from "../../../src/worker/guard/turnstile";
import { creaAvvisoTelegram } from "../../../src/worker/guard/avviso";
import { idIp, idVisitatore } from "../../../src/worker/guard/visitatore";

const ORA = new Date("2026-10-02T10:00:00.000Z");

function turnstileFetch(success: boolean | "errore") {
  return vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) => {
    if (success === "errore") throw new Error("rete");
    return Response.json({ success });
  });
}

function ctx(over: Partial<ContestoGuard> = {}): ContestoGuard {
  return {
    cfg: { ...loadConfig({}), quotaVisitatore: 2, quotaIp: 100, tettoGiornaliero: 5 },
    db: testEnv().DB,
    rateLimiter: { limit: async () => ({ success: true }) },
    ip: "1.2.3.4",
    ipHash: "ip-default",
    visitatore: "v1",
    turnstileToken: "tok",
    turnstileSecret: "sec",
    src: null,
    fetch: turnstileFetch(true),
    now: () => ORA,
    avvisa: vi.fn(async () => {}),
    waitUntil: (p) => void p,
    ...over,
  };
}

describe("verificaTurnstile", () => {
  it("invia segreto, token e IP a siteverify", async () => {
    const f = turnstileFetch(true);
    expect(await verificaTurnstile("tok", "sec", "1.2.3.4", f)).toBe("ok");
    const [url, init] = f.mock.calls[0];
    expect(String(url)).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init!.body as FormData;
    expect([body.get("secret"), body.get("response"), body.get("remoteip")]).toEqual(["sec", "tok", "1.2.3.4"]);
  });
  it("distingue token rifiutato, token vuoto e servizio irraggiungibile", async () => {
    expect(await verificaTurnstile("tok", "sec", "", turnstileFetch(false))).toBe("fallito");
    expect(await verificaTurnstile("", "sec", "", turnstileFetch(true))).toBe("fallito");
    expect(await verificaTurnstile("tok", "sec", "", turnstileFetch("errore"))).toBe("irraggiungibile");
  });
});

describe("checkAccesso", () => {
  it("procede con limite rispettato e token valido", async () => {
    expect(await checkAccesso(ctx())).toBe("procedi");
  });
  it("blocca per troppe richieste prima di chiamare Turnstile", async () => {
    const f = turnstileFetch(true);
    const esito = await checkAccesso(ctx({ rateLimiter: { limit: async () => ({ success: false }) }, fetch: f }));
    expect(esito).toEqual({ blocca: "troppe_richieste" });
    expect(f).not.toHaveBeenCalled();
  });
  it("blocca con token non valido e passa in leggera se Turnstile è irraggiungibile", async () => {
    expect(await checkAccesso(ctx({ fetch: turnstileFetch(false) }))).toEqual({ blocca: "verifica_fallita" });
    expect(await checkAccesso(ctx({ fetch: turnstileFetch("errore") }))).toBe("leggera");
  });
  it("i blocchi d'accesso non scrivono su D1 (una raffica non deve consumare le scritture)", async () => {
    await checkAccesso(ctx({ fetch: turnstileFetch(false), visitatore: "v-evento" }));
    await checkAccesso(ctx({ rateLimiter: { limit: async () => ({ success: false }) } }));
    const r = await testEnv().DB.prepare("SELECT COUNT(*) AS n FROM eventi WHERE difesa IN ('turnstile','velocita')").first<{ n: number }>();
    expect(r?.n).toBe(0);
  });
});

describe("checkSpesa", () => {
  it("quota visitatore: oltre la quota passa in leggera, gli altri visitatori no", async () => {
    expect(await checkSpesa(ctx({ visitatore: "q1" }))).toBe("procedi");
    expect(await checkSpesa(ctx({ visitatore: "q1" }))).toBe("procedi");
    expect(await checkSpesa(ctx({ visitatore: "q1" }))).toBe("leggera");
    expect(await checkSpesa(ctx({ visitatore: "q2" }))).toBe("procedi");
  });
  it("tetto globale: oltre il tetto tutti in leggera, avviso una sola volta all'80%", async () => {
    const avvisa = vi.fn(async (_m: string) => {});
    const domani = () => new Date("2026-10-03T10:00:00.000Z");
    const esiti = [];
    for (let i = 0; i < 6; i++) esiti.push(await checkSpesa(ctx({ visitatore: `g${i}`, now: domani, avvisa })));
    expect(esiti).toEqual(["procedi", "procedi", "procedi", "procedi", "procedi", "leggera"]);
    expect(avvisa).toHaveBeenCalledTimes(1);
    expect(avvisa.mock.calls[0][0]).toContain("4/5");
  });
  it("quota per IP: cambiare cookie (nuovo visitatore) non aggira il limite giornaliero dell'IP", async () => {
    const quando = () => new Date("2026-10-06T10:00:00.000Z");
    const cfg = { ...loadConfig({}), quotaVisitatore: 5, quotaIp: 3, tettoGiornaliero: 1000 };
    const esiti = [];
    for (let i = 0; i < 4; i++) esiti.push(await checkSpesa(ctx({ cfg, ipHash: "ip-bot", visitatore: `cookie-nuovo-${i}`, now: quando })));
    expect(esiti).toEqual(["procedi", "procedi", "procedi", "leggera"]);
    expect(await checkSpesa(ctx({ cfg, ipHash: "ip-altro", visitatore: "x", now: quando }))).toBe("procedi");
  });

  it("registra in eventi i passaggi in leggera dovuti alla spesa", async () => {
    const quando = () => new Date("2026-10-05T10:00:00.000Z");
    for (let i = 0; i < 3; i++) await checkSpesa(ctx({ visitatore: "log1", now: quando }));
    const r = await testEnv().DB.prepare("SELECT tipo, difesa, dettaglio FROM eventi WHERE difesa = 'quota_visitatore'").first();
    expect(r).toEqual({ tipo: "blocco", difesa: "quota_visitatore", dettaglio: "leggera" });
  });

  it("se D1 non risponde procede (i tetti nei pannelli restano la garanzia)", async () => {
    const dbRotto = { prepare: () => { throw new Error("D1 giù"); } } as unknown as D1Database;
    expect(await checkSpesa(ctx({ db: dbRotto }))).toBe("procedi");
  });
});

describe("avviso e visitatore", () => {
  it("creaAvvisoTelegram chiama sendMessage e non lancia se manca la configurazione", async () => {
    const f = vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) => new Response("{}"));
    await creaAvvisoTelegram("TOKEN", "42", f)("ciao");
    expect(String(f.mock.calls[0][0])).toBe("https://api.telegram.org/botTOKEN/sendMessage");
    expect(JSON.parse(String((f.mock.calls[0][1] as RequestInit).body))).toEqual({ chat_id: "42", text: "ciao" });
    await expect(creaAvvisoTelegram(undefined, undefined, f)("x")).resolves.toBeUndefined();
  });
  it("idIp non contiene l'IP, dipende dal sale e cambia con il giorno", async () => {
    const a = await idIp("1.2.3.4", "s", ORA);
    expect(a).not.toContain("1.2.3.4");
    expect(await idIp("1.2.3.4", "altro", ORA)).not.toBe(a);
    expect(await idIp("1.2.3.4", "s", new Date("2026-10-03T10:00:00Z"))).not.toBe(a);
  });
  it("idVisitatore cambia con il giorno e non contiene l'IP", async () => {
    const a = await idVisitatore("1.2.3.4", "c1", "s", ORA);
    expect(a).not.toContain("1.2.3.4");
    expect(await idVisitatore("1.2.3.4", "c1", "s", ORA)).toBe(a);
    expect(await idVisitatore("1.2.3.4", "c1", "s", new Date("2026-10-03T10:00:00Z"))).not.toBe(a);
  });
});
