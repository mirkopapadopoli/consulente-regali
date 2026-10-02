export const MAX_TESTO = 300;
export const MIN_TESTO = 3;
export const ID_RE = /^[0-9A-Za-z]{8}$/;
export const ASIN_RE = /^[A-Z0-9]{10}$/;

const URL_RE = /https?:\/\/\S+|www\.\S+/gi;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

/** Testo pronto per l'AI: senza URL/email, spazi compattati, max 300 caratteri. */
export function pulisciTesto(s: string): string {
  return s
    .replace(URL_RE, " ")
    .replace(EMAIL_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TESTO)
    .trim();
}

/** Chiave di cache: minuscole, niente punteggiatura/emoji, cifre ed € mantenuti. */
export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}€\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FORMATO_GIORNO = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data YYYY-MM-DD secondo il fuso Europe/Rome. */
export function giornoRoma(d: Date): string {
  return FORMATO_GIORNO.format(d);
}

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function idBreve(n = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map((b) => B62[b % 62]).join("");
}
