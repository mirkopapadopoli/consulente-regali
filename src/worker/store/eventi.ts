export type TipoEvento = "ricerca" | "click" | "carrello" | "condivisione" | "blocco";

export interface NuovoEvento {
  tipo: TipoEvento;
  risultatoId?: string | null;
  asin?: string | null;
  difesa?: string | null;
  dettaglio?: string | null;
  src?: string | null;
}

export async function registraEvento(db: D1Database, e: NuovoEvento, now: Date): Promise<void> {
  await db
    .prepare("INSERT INTO eventi (quando, tipo, risultato_id, asin, difesa, dettaglio, src) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
    .bind(now.toISOString(), e.tipo, e.risultatoId ?? null, e.asin ?? null, e.difesa ?? null, e.dettaglio ?? null, e.src ?? null)
    .run();
}
