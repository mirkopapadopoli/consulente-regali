import { giornoRoma, sha256Hex } from "../../shared/testo";

/** Identificativo dell'IP per la quota giornaliera: non dipende dal cookie, l'IP non viene salvato. */
export function idIp(ip: string, salt: string, now: Date): Promise<string> {
  return sha256Hex(`ip|${ip}|${salt}|${giornoRoma(now)}`);
}

/** Identificativo anonimo che cambia ogni giorno: l'IP non viene mai salvato. */
export function idVisitatore(ip: string, cookieId: string, salt: string, now: Date): Promise<string> {
  return sha256Hex(`${ip}|${cookieId}|${salt}|${giornoRoma(now)}`);
}
