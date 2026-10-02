import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { streamSSE } from "hono/streaming";
import { ASIN_RE, ID_RE, MIN_TESTO, pulisciTesto } from "../shared/testo";
import type { EventoSSE } from "../shared/types";
import { capire } from "./ai/capire";
import { chatJson } from "./ai/openrouter";
import { scegli } from "./ai/scegli";
import { loadConfig } from "./config";
import type { Env } from "./env";
import { eseguiRicerca } from "./flusso";
import { creaAvvisoTelegram } from "./guard/avviso";
import { checkAccesso, checkSpesa } from "./guard/index";
import type { ContestoGuard } from "./guard/tipi";
import { idIp, idVisitatore } from "./guard/visitatore";
import { ApifySource } from "./products/apify";
import { registraEvento } from "./store/eventi";
import { pulisci } from "./store/pulizia";
import { leggiRisultato } from "./store/risultati";
import { sicuro } from "./store/sicuro";

const COOKIE = "cr_vid";
const COOKIE_RE = /^[\w-]{10,64}$/;
const TIPI_EVENTO_PUBBLICI = new Set(["click", "carrello", "condivisione"]);

const fetchGlobale: typeof fetch = (i, init) => fetch(i, init);

function pulisciSrc(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.slice(0, 40).replace(/[^\w-]/g, "");
  return s === "" ? null : s;
}

export const app = new Hono<{ Bindings: Env }>();

app.get("/api/salute", (c) => c.json({ ok: true }));

app.get("/api/config", (c) => {
  const cfg = loadConfig(c.env);
  return c.json({ turnstileSiteKey: cfg.turnstileSiteKey, affiliateTag: cfg.affiliateTag });
});

app.post("/api/cerca", async (c) => {
  const cfg = loadConfig(c.env);
  const body = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  const testo = typeof body?.testo === "string" ? pulisciTesto(body.testo) : "";
  if (testo.length < MIN_TESTO) return c.json({ errore: "testo" }, 400);
  const escludi = Array.isArray(body?.escludi)
    ? body.escludi.filter((a): a is string => typeof a === "string" && ASIN_RE.test(a)).slice(0, 30)
    : [];
  const src = pulisciSrc(body?.src);
  const turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";

  let cookieId = getCookie(c, COOKIE);
  if (!cookieId || !COOKIE_RE.test(cookieId)) {
    cookieId = crypto.randomUUID();
    setCookie(c, COOKIE, cookieId, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  const now = () => new Date();
  const ip = c.req.header("cf-connecting-ip") ?? "";
  const ctx: ContestoGuard = {
    cfg,
    db: c.env.DB,
    rateLimiter: c.env.RATE_LIMITER,
    ip,
    ipHash: await idIp(ip, c.env.VISITOR_SALT, now()),
    visitatore: await idVisitatore(ip, cookieId, c.env.VISITOR_SALT, now()),
    turnstileToken,
    turnstileSecret: c.env.TURNSTILE_SECRET,
    src,
    fetch: fetchGlobale,
    now,
    avvisa: creaAvvisoTelegram(c.env.TELEGRAM_BOT_TOKEN, c.env.TELEGRAM_CHAT_ID, fetchGlobale),
    waitUntil: (p) => c.executionCtx.waitUntil(p),
  };
  const accesso = await checkAccesso(ctx);

  return streamSSE(c, async (stream) => {
    const emetti = (e: EventoSSE) => stream.writeSSE({ data: JSON.stringify(e) });
    if (typeof accesso === "object") {
      await emetti({ tipo: "bloccato", motivo: accesso.blocca });
      return;
    }
    const chat = (system: string, user: string) =>
      chatJson({ apiKey: c.env.OPENROUTER_API_KEY, model: cfg.aiModel, timeoutMs: cfg.aiTimeoutMs, fetch: fetchGlobale }, system, user);
    await eseguiRicerca(
      { testo, src, escludi, forzaLeggera: accesso === "leggera" },
      {
        cfg,
        db: c.env.DB,
        source: new ApifySource({ token: c.env.APIFY_TOKEN, actor: cfg.apifyActor, timeoutMs: cfg.apifyTimeoutMs, fetch: fetchGlobale, now }),
        capire: (t) => capire(t, chat),
        scegli: (t, candidati) => scegli(t, candidati, chat),
        checkSpesa: () => checkSpesa(ctx),
        now,
      },
      emetti,
    );
  });
});

app.get("/api/risultati/:id", async (c) => {
  const id = c.req.param("id");
  const r = ID_RE.test(id) ? await sicuro(() => leggiRisultato(c.env.DB, id)) : null;
  return r ? c.json(r) : c.json({ errore: "non_trovato" }, 404);
});

app.post("/api/evento", async (c) => {
  const { success } = await c.env.EVENTI_LIMITER.limit({ key: c.req.header("cf-connecting-ip") || "sconosciuto" });
  if (!success) return c.json({ errore: "troppe_richieste" }, 429);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await c.req.text()) as Record<string, unknown>;
  } catch {
    return c.json({ errore: "json" }, 400);
  }
  const tipo = body.tipo;
  const asin = body.asin;
  const risultatoId = body.risultatoId;
  if (typeof tipo !== "string" || !TIPI_EVENTO_PUBBLICI.has(tipo)) return c.json({ errore: "tipo" }, 400);
  if (asin !== undefined && (typeof asin !== "string" || !ASIN_RE.test(asin))) return c.json({ errore: "asin" }, 400);
  if (risultatoId !== undefined && (typeof risultatoId !== "string" || !ID_RE.test(risultatoId))) return c.json({ errore: "id" }, 400);
  await sicuro(() =>
    registraEvento(
      c.env.DB,
      {
        tipo: tipo as "click" | "carrello" | "condivisione",
        asin: (asin as string | undefined) ?? null,
        risultatoId: (risultatoId as string | undefined) ?? null,
        src: pulisciSrc(body.src),
      },
      new Date(),
    ),
  );
  return c.body(null, 204);
});

export default {
  fetch: app.fetch,
  async scheduled(_evento, env, ctx) {
    ctx.waitUntil(pulisci(env.DB, new Date()));
  },
} satisfies ExportedHandler<Env>;
