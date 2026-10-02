import type { Difesa } from "./tipi";

/** Difesa 2: binding ratelimit (3 ricerche / 60 s per IP, da wrangler.jsonc). */
export const difesaVelocita: Difesa = async (ctx) => {
  const { success } = await ctx.rateLimiter.limit({ key: ctx.ip || "sconosciuto" });
  return success ? "procedi" : { blocca: "troppe_richieste" };
};
