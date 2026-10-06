-- Aggiunge il tipo 'visita' agli eventi: senza, chi apre il sito e non cerca non viene contato.
-- SQLite non modifica un CHECK esistente: si ricrea la tabella copiando i dati.
CREATE TABLE eventi_nuova (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('visita','ricerca','click','carrello','condivisione','blocco')),
  risultato_id TEXT,
  asin TEXT,
  difesa TEXT,
  dettaglio TEXT,
  src TEXT
);
INSERT INTO eventi_nuova (id, quando, tipo, risultato_id, asin, difesa, dettaglio, src)
  SELECT id, quando, tipo, risultato_id, asin, difesa, dettaglio, src FROM eventi;
DROP TABLE eventi;
ALTER TABLE eventi_nuova RENAME TO eventi;
CREATE INDEX idx_eventi_quando ON eventi(quando);
