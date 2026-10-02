export async function incrementa(db: D1Database, giorno: string, chiave: string): Promise<number> {
  const riga = await db
    .prepare(
      "INSERT INTO contatori (giorno, chiave, valore) VALUES (?1, ?2, 1) ON CONFLICT (giorno, chiave) DO UPDATE SET valore = valore + 1 RETURNING valore",
    )
    .bind(giorno, chiave)
    .first<{ valore: number }>();
  if (!riga) throw new Error("incrementa: nessun valore restituito");
  return riga.valore;
}

export async function leggiContatore(db: D1Database, giorno: string, chiave: string): Promise<number> {
  const riga = await db
    .prepare("SELECT valore FROM contatori WHERE giorno = ?1 AND chiave = ?2")
    .bind(giorno, chiave)
    .first<{ valore: number }>();
  return riga?.valore ?? 0;
}
