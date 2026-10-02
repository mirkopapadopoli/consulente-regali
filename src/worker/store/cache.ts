import { normalizza, sha256Hex } from "../../shared/testo";
import type { Prodotto } from "../../shared/types";

export const TTL_CACHE_MS = 24 * 3600 * 1000;

const scadenza = (now: Date) => new Date(now.getTime() + TTL_CACHE_MS).toISOString();

export function chiaveRicerca(query: string, budget: number): Promise<string> {
  return sha256Hex(`${normalizza(query)}|${budget}`);
}

export async function leggiCacheRicerca(db: D1Database, chiave: string, now: Date): Promise<Prodotto[] | null> {
  const riga = await db
    .prepare("SELECT prodotti_json FROM cache_ricerche WHERE chiave = ?1 AND scade_il > ?2")
    .bind(chiave, now.toISOString())
    .first<{ prodotti_json: string }>();
  return riga ? (JSON.parse(riga.prodotti_json) as Prodotto[]) : null;
}

export async function scriviCacheRicerca(db: D1Database, chiave: string, prodotti: Prodotto[], now: Date): Promise<void> {
  await db
    .prepare("INSERT OR REPLACE INTO cache_ricerche (chiave, prodotti_json, scade_il) VALUES (?1, ?2, ?3)")
    .bind(chiave, JSON.stringify(prodotti), scadenza(now))
    .run();
}

export async function leggiCacheRichiesta(db: D1Database, hash: string, now: Date): Promise<string | null> {
  const riga = await db
    .prepare("SELECT risultato_id FROM cache_richieste WHERE hash_testo = ?1 AND scade_il > ?2")
    .bind(hash, now.toISOString())
    .first<{ risultato_id: string }>();
  return riga?.risultato_id ?? null;
}

export async function scriviCacheRichiesta(db: D1Database, hash: string, risultatoId: string, now: Date): Promise<void> {
  await db
    .prepare("INSERT OR REPLACE INTO cache_richieste (hash_testo, risultato_id, scade_il) VALUES (?1, ?2, ?3)")
    .bind(hash, risultatoId, scadenza(now))
    .run();
}
