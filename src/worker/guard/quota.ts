import { giornoRoma } from "../../shared/testo";
import { incrementa } from "../store/contatori";
import type { Difesa } from "./tipi";

/** Difesa 3a: ricerche complete per IP al giorno; cambiare cookie non la aggira. */
export const difesaQuotaIp: Difesa = async (ctx) => {
  const n = await incrementa(ctx.db, giornoRoma(ctx.now()), `ip:${ctx.ipHash}`);
  return n <= ctx.cfg.quotaIp ? "procedi" : "leggera";
};

/** Difesa 3: ricerche complete per visitatore al giorno; oltre → leggera. */
export const difesaQuotaVisitatore: Difesa = async (ctx) => {
  const n = await incrementa(ctx.db, giornoRoma(ctx.now()), `v:${ctx.visitatore}`);
  return n <= ctx.cfg.quotaVisitatore ? "procedi" : "leggera";
};

/** Difesa 6: ricerche complete totali al giorno; avviso Telegram una volta all'80%. */
export const difesaTettoGlobale: Difesa = async (ctx) => {
  const n = await incrementa(ctx.db, giornoRoma(ctx.now()), "globale");
  const tetto = ctx.cfg.tettoGiornaliero;
  if (n === Math.ceil(tetto * 0.8)) {
    ctx.waitUntil(ctx.avvisa(`⚠️ cosaregalo: ${n}/${tetto} ricerche complete oggi (80% del tetto giornaliero).`));
  }
  return n <= tetto ? "procedi" : "leggera";
};
