import { normalizza, pulisciTesto, sha256Hex } from "../shared/testo";
import type { Candidato, Capito, EventoSSE, Idea, Modalita, Prodotto, ProductSource, Scelta, SceltaConProdotto } from "../shared/types";
import type { Config } from "./config";
import type { Esito } from "./guard/tipi";
import { fallbackScelte } from "./ai/scegli";
import { filtraCandidati } from "./products/filtri";
import { chiaveRicerca, leggiCacheRicerca, leggiCacheRichiesta, scriviCacheRicerca, scriviCacheRichiesta } from "./store/cache";
import { registraEvento } from "./store/eventi";
import { leggiRisultato, salvaRisultato } from "./store/risultati";
import { sicuro } from "./store/sicuro";

export interface DipendenzeFlusso {
  cfg: Config;
  db: D1Database;
  source: ProductSource;
  capire: (testo: string) => Promise<Capito>;
  scegli: (testo: string, candidati: Candidato[]) => Promise<{ scelte: Scelta[]; ai: boolean }>;
  checkSpesa: () => Promise<Esito>;
  now: () => Date;
}

export interface RichiestaRicerca {
  testo: string;
  src: string | null;
  escludi: string[];
  forzaLeggera: boolean;
}

export type Emetti = (e: EventoSSE) => Promise<void>;

function senzaRicerca({ ricerca: _r, ...p }: Candidato): Prodotto {
  return p;
}

export async function eseguiRicerca(req: RichiestaRicerca, d: DipendenzeFlusso, emetti: Emetti): Promise<void> {
  const testo = pulisciTesto(req.testo);
  const usaCacheRichieste = req.escludi.length === 0 && !req.forzaLeggera;
  const hash = await sha256Hex(normalizza(testo));

  // Difesa 4a: stessa richiesta già risolta di recente → zero costi.
  if (usaCacheRichieste) {
    const id = await sicuro(() => leggiCacheRichiesta(d.db, hash, d.now()));
    const salvato = id ? await sicuro(() => leggiRisultato(d.db, id)) : null;
    if (salvato && salvato.modalita === "completa") {
      await emetti({ tipo: "capito", capito: salvato.capito });
      await emetti({ tipo: "risultati", modalita: "completa", scelte: salvato.scelte, idee: salvato.idee });
      await emetti({ tipo: "salvato", id: salvato.id });
      return;
    }
  }

  let capito: Capito;
  try {
    capito = await d.capire(testo);
  } catch (e) {
    console.error("capire fallito", e);
    await emetti({ tipo: "errore" });
    return;
  }
  // Difesa 5: testo non pertinente → stop prima di qualsiasi spesa.
  if (!capito.regalo) {
    await emetti({ tipo: "non_capito" });
    return;
  }
  await emetti({ tipo: "capito", capito });

  const budget = capito.budgetMax ?? d.cfg.budgetDefault;
  const idee: Idea[] = capito.ricerche.map((ricerca) => ({ ricerca, perche: null }));

  const salva = async (modalita: Modalita, scelte: SceltaConProdotto[], ideeSalvate: Idea[], dettaglio: string) => {
    const now = d.now();
    const id = await sicuro(() =>
      salvaRisultato(d.db, { creatoIl: now.toISOString(), titolo: capito.titolo, capito, scelte, idee: ideeSalvate, modalita, src: req.src }),
    );
    await sicuro(() => registraEvento(d.db, { tipo: "ricerca", risultatoId: id, dettaglio, src: req.src }, now));
    return id;
  };

  const leggera = async (motivo: string) => {
    await emetti({ tipo: "risultati", modalita: "leggera", idee });
    const id = await salva("leggera", [], idee, `leggera:${motivo}`);
    if (id) await emetti({ tipo: "salvato", id });
  };

  if (req.forzaLeggera) return leggera("turnstile");

  // Difesa 4b: ricerche già fatte da chiunque nelle ultime 24 ore.
  const chiavi = await Promise.all(capito.ricerche.map((q) => chiaveRicerca(q, budget)));
  const inCache = await Promise.all(chiavi.map((k) => sicuro(() => leggiCacheRicerca(d.db, k, d.now()))));
  if (inCache.some((c) => c === null)) {
    const esito = await d.checkSpesa();
    if (esito !== "procedi") return leggera("spesa");
  }

  const gruppi = await Promise.allSettled(
    capito.ricerche.map(async (q, i) => {
      const daCache = inCache[i];
      if (daCache) return daCache;
      const prodotti = await d.source.search(q, budget, d.cfg.apifyPerRicerca);
      await sicuro(() => scriviCacheRicerca(d.db, chiavi[i], prodotti, d.now()));
      return prodotti;
    }),
  );
  if (gruppi.every((g) => g.status === "rejected")) return leggera("apify");
  for (const g of gruppi) if (g.status === "rejected") console.error("ricerca Apify fallita", g.reason);

  const candidati = filtraCandidati(
    gruppi.map((g) => (g.status === "fulfilled" ? g.value : [])),
    { budgetMax: budget, minStelle: d.cfg.minStelle, minRecensioni: d.cfg.minRecensioni, escludi: new Set(req.escludi) },
  );
  if (candidati.length === 0) return leggera("nessun_prodotto");

  let scelte: Scelta[];
  try {
    ({ scelte } = await d.scegli(testo, candidati));
  } catch (e) {
    console.error("scegli fallito in modo imprevisto", e);
    scelte = fallbackScelte(candidati, Math.min(3, candidati.length));
  }
  const perAsin = new Map(candidati.map((c) => [c.asin, c]));
  const sceltePiene: SceltaConProdotto[] = scelte.map((s) => ({ ...s, prodotto: senzaRicerca(perAsin.get(s.asin)!) }));
  const ricercheUsate = new Set(scelte.map((s) => perAsin.get(s.asin)!.ricerca));
  const ideeExtra = idee.filter((_, i) => !ricercheUsate.has(i)).slice(0, Math.max(0, 3 - sceltePiene.length));

  await emetti({ tipo: "risultati", modalita: "completa", scelte: sceltePiene, idee: ideeExtra });
  const id = await salva("completa", sceltePiene, ideeExtra, "completa");
  if (id) {
    await emetti({ tipo: "salvato", id });
    if (usaCacheRichieste) await sicuro(() => scriviCacheRichiesta(d.db, hash, id, d.now()));
  }
}
