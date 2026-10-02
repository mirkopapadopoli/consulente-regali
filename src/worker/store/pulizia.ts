import { giornoRoma } from "../../shared/testo";

const GIORNO_MS = 24 * 3600 * 1000;

export async function pulisci(db: D1Database, now: Date): Promise<void> {
  const ora = now.toISOString();
  const eventiPrima = new Date(now.getTime() - 90 * GIORNO_MS).toISOString();
  const contatoriPrima = giornoRoma(new Date(now.getTime() - 7 * GIORNO_MS));
  await db.batch([
    db.prepare("DELETE FROM eventi WHERE quando < ?1").bind(eventiPrima),
    db.prepare("DELETE FROM cache_ricerche WHERE scade_il <= ?1").bind(ora),
    db.prepare("DELETE FROM cache_richieste WHERE scade_il <= ?1").bind(ora),
    db.prepare("DELETE FROM contatori WHERE giorno < ?1").bind(contatoriPrima),
  ]);
}
