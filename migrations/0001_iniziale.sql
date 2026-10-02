CREATE TABLE risultati (
  id TEXT PRIMARY KEY,
  creato_il TEXT NOT NULL,
  titolo TEXT NOT NULL,
  capito_json TEXT NOT NULL,
  contenuto_json TEXT NOT NULL,
  modalita TEXT NOT NULL CHECK (modalita IN ('completa','leggera')),
  src TEXT
);
CREATE TABLE cache_ricerche (
  chiave TEXT PRIMARY KEY,
  prodotti_json TEXT NOT NULL,
  scade_il TEXT NOT NULL
);
CREATE TABLE cache_richieste (
  hash_testo TEXT PRIMARY KEY,
  risultato_id TEXT NOT NULL REFERENCES risultati(id),
  scade_il TEXT NOT NULL
);
CREATE TABLE contatori (
  giorno TEXT NOT NULL,
  chiave TEXT NOT NULL,
  valore INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (giorno, chiave)
);
CREATE TABLE eventi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ricerca','click','carrello','condivisione','blocco')),
  risultato_id TEXT,
  asin TEXT,
  difesa TEXT,
  dettaglio TEXT,
  src TEXT
);
CREATE INDEX idx_eventi_quando ON eventi(quando);
