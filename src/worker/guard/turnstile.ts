import type { Difesa } from "./tipi";

export async function verificaTurnstile(
  token: string,
  secret: string,
  ip: string,
  f: typeof fetch,
): Promise<"ok" | "fallito" | "irraggiungibile"> {
  if (!token) return "fallito";
  try {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    if (ip) body.append("remoteip", ip);
    const res = await f("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "irraggiungibile";
    const dati = (await res.json()) as { success?: boolean };
    return dati.success === true ? "ok" : "fallito";
  } catch {
    return "irraggiungibile";
  }
}

/** Difesa 1: token monouso obbligatorio; servizio giù → solo modalità leggera. */
export const difesaTurnstile: Difesa = async (ctx) => {
  const v = await verificaTurnstile(ctx.turnstileToken, ctx.turnstileSecret, ctx.ip, ctx.fetch);
  if (v === "ok") return "procedi";
  return v === "irraggiungibile" ? "leggera" : { blocca: "verifica_fallita" };
};
