import type { Env } from "./env";

export interface Config {
  aiModel: string;
  aiTimeoutMs: number;
  apifyActor: string;
  apifyPerRicerca: number;
  apifyTimeoutMs: number;
  minStelle: number;
  minRecensioni: number;
  quotaVisitatore: number;
  quotaIp: number;
  tettoGiornaliero: number;
  affiliateTag: string;
  turnstileSiteKey: string;
  budgetDefault: number;
}

function num(v: string | number | undefined, predefinito: number): number {
  if (v === undefined || (typeof v === "string" && v.trim() === "")) return predefinito;
  const n = Number(v);
  return Number.isFinite(n) ? n : predefinito;
}

function str(v: string | undefined, predefinito: string): string {
  return v && v.trim() !== "" ? v.trim() : predefinito;
}

export function loadConfig(env: Partial<Env>): Config {
  return {
    aiModel: str(env.AI_MODEL, "deepseek/deepseek-v4.1-flash"),
    aiTimeoutMs: num(env.AI_TIMEOUT_MS, 10000),
    apifyActor: str(env.APIFY_ACTOR, "junglee~amazon-crawler"),
    apifyPerRicerca: num(env.APIFY_RISULTATI_PER_RICERCA, 5),
    apifyTimeoutMs: num(env.APIFY_TIMEOUT_MS, 20000),
    minStelle: num(env.MIN_STELLE, 4),
    minRecensioni: num(env.MIN_RECENSIONI, 20),
    quotaVisitatore: num(env.QUOTA_VISITATORE, 5),
    quotaIp: num(env.QUOTA_IP, 15),
    tettoGiornaliero: num(env.TETTO_GIORNALIERO, 150),
    affiliateTag: str(env.AFFILIATE_TAG, "mirkopapadopo-21"),
    turnstileSiteKey: str(env.TURNSTILE_SITE_KEY, ""),
    budgetDefault: 100,
  };
}
