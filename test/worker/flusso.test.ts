import { beforeEach, describe, expect, it, vi } from "vitest";
import { testEnv } from "../helpers/env";
import { FakeSource, prodotto } from "../helpers/fake-source";
import { loadConfig } from "../../src/worker/config";
import { type DipendenzeFlusso, eseguiRicerca, type RichiestaRicerca } from "../../src/worker/flusso";
import { ErroreAI } from "../../src/worker/ai/openrouter";
import type { Candidato, Capito, EventoSSE } from "../../src/shared/types";

const ORA = new Date("2026-10-02T10:00:00.000Z");
const RICERCHE = ["set attrezzi giardinaggio", "vaso design", "kit semi aromatiche"];
const CAPITO: Capito = { regalo: true, destinatario: "mamma", interessi: ["giardinaggio"], budgetMax: 40, occasione: null, ricerche: RICERCHE, titolo: "3 regali per una mamma" };

let contatore = 0;
function richiesta(over: Partial<RichiestaRicerca> = {}): RichiestaRicerca {
  contatore++;
  return { testo: `mia mamma giardinaggio 40 euro variante ${contatore}`, src: null, escludi: [], forzaLeggera: false, ...over };
}

type Deps = DipendenzeFlusso & { source: FakeSource };

function deps(over: Partial<DipendenzeFlusso> = {}): Deps {
  const source = new FakeSource({
    [RICERCHE[0]]: [prodotto("A000000001"), prodotto("A000000002")],
    [RICERCHE[1]]: [prodotto("A000000003")],
    [RICERCHE[2]]: [prodotto("A000000004")],
  });
  return {
    cfg: loadConfig({}),
    db: testEnv().DB,
    source,
    capire: vi.fn(async (_t: string) => CAPITO),
    scegli: vi.fn(async (_t: string, candidati: Candidato[]) => ({ scelte: candidati.slice(0, 3).map((c) => ({ asin: c.asin, perche: `per ${c.asin}` })), ai: true })),
    checkSpesa: vi.fn(async () => "procedi" as const),
    now: () => ORA,
    ...over,
  } as Deps;
}

async function esegui(req: RichiestaRicerca, d: DipendenzeFlusso): Promise<EventoSSE[]> {
  const eventi: EventoSSE[] = [];
  await eseguiRicerca(req, d, async (e) => { eventi.push(e); });
  return eventi;
}

const tipi = (ev: EventoSSE[]) => ev.map((e) => (e.tipo === "risultati" ? `risultati:${e.modalita}` : e.tipo));

beforeEach(async () => {
  await testEnv().DB.prepare("DELETE FROM cache_ricerche").run();
});

describe("eseguiRicerca", () => {
  it("percorso completo: capito → risultati completi → salvato", async () => {
    const d = deps();
    const ev = await esegui(richiesta(), d);
    expect(tipi(ev)).toEqual(["capito", "risultati:completa", "salvato"]);
    const ris = ev[1] as Extract<EventoSSE, { tipo: "risultati"; modalita: "completa" }>;
    expect(ris.scelte.map((s) => s.asin)).toEqual(["A000000001", "A000000002", "A000000003"]);
    expect(ris.scelte[0].prodotto).not.toHaveProperty("ricerca");
    expect(d.source.chiamate.map((c) => [c.query, c.budgetMax, c.max])).toEqual(RICERCHE.map((q) => [q, 40, 5]));
  });

  it("budget assente usa 100 €", async () => {
    const d = deps({ capire: vi.fn(async () => ({ ...CAPITO, budgetMax: null })) });
    await esegui(richiesta(), d);
    expect(d.source.chiamate.every((c) => c.budgetMax === 100)).toBe(true);
  });

  it("errore di capire → solo evento errore, nessuna ricerca", async () => {
    const d = deps({ capire: vi.fn(async () => { throw new ErroreAI("x"); }) });
    expect(tipi(await esegui(richiesta(), d))).toEqual(["errore"]);
    expect(d.source.chiamate).toHaveLength(0);
  });

  it("testo che non è una richiesta regalo → non_capito, nessuna spesa", async () => {
    const d = deps({ capire: vi.fn(async () => ({ ...CAPITO, regalo: false, ricerche: [] })) });
    expect(tipi(await esegui(richiesta(), d))).toEqual(["non_capito"]);
    expect(d.checkSpesa).not.toHaveBeenCalled();
    expect(d.source.chiamate).toHaveLength(0);
  });

  it("una ricerca Apify fallita non ferma le altre", async () => {
    const d = deps();
    d.source = new FakeSource({ [RICERCHE[0]]: new Error("timeout"), [RICERCHE[1]]: [prodotto("A000000003")], [RICERCHE[2]]: [prodotto("A000000004")] });
    expect(tipi(await esegui(richiesta(), d))).toEqual(["capito", "risultati:completa", "salvato"]);
  });

  it("tutte le ricerche fallite → modalità leggera con le 3 ricerche come idee", async () => {
    const d = deps();
    d.source = new FakeSource(Object.fromEntries(RICERCHE.map((q) => [q, new Error("giù")])));
    const ev = await esegui(richiesta(), d);
    expect(tipi(ev)).toEqual(["capito", "risultati:leggera", "salvato"]);
    expect((ev[1] as Extract<EventoSSE, { tipo: "risultati" }>).idee.map((i) => i.ricerca)).toEqual(RICERCHE);
  });

  it("meno di 3 prodotti dopo i filtri → card trovate + idee per completare", async () => {
    const d = deps();
    d.source = new FakeSource({ [RICERCHE[0]]: [prodotto("A000000001")], [RICERCHE[1]]: [prodotto("A000000009", { stelle: 2 })], [RICERCHE[2]]: [] });
    const ev = await esegui(richiesta(), d);
    const ris = ev[1] as Extract<EventoSSE, { tipo: "risultati"; modalita: "completa" }>;
    expect(ris.scelte).toHaveLength(1);
    expect(ris.idee.map((i) => i.ricerca)).toEqual([RICERCHE[1], RICERCHE[2]]);
  });

  it("guardie di spesa in leggera → nessuna chiamata ad Apify", async () => {
    const d = deps({ checkSpesa: vi.fn(async () => "leggera" as const) });
    expect(tipi(await esegui(richiesta(), d))).toEqual(["capito", "risultati:leggera", "salvato"]);
    expect(d.source.chiamate).toHaveLength(0);
  });

  it("ricerche tutte in cache → checkSpesa non viene chiamata", async () => {
    await esegui(richiesta(), deps());
    const d = deps();
    await esegui(richiesta(), d);
    expect(d.checkSpesa).not.toHaveBeenCalled();
    expect(d.source.chiamate).toHaveLength(0);
  });

  it("stesso testo due volte → la seconda viene dalla cache richieste senza AI", async () => {
    const r = richiesta({ testo: "Papà runner, 50€!" });
    await esegui(r, deps());
    const d = deps();
    const ev = await esegui({ ...r, testo: "papà RUNNER 50€" }, d);
    expect(tipi(ev)).toEqual(["capito", "risultati:completa", "salvato"]);
    expect(d.capire).not.toHaveBeenCalled();
  });

  it("risposta dalla cache richieste → registra comunque la ricerca, con dettaglio cache e src", async () => {
    const r = richiesta({ testo: "Nonno pescatore, 30€", src: "ig-ads" });
    await esegui(r, deps());
    await esegui({ ...r, src: "ig-dm" }, deps());
    const righe = await testEnv()
      .DB.prepare("SELECT dettaglio, src FROM eventi WHERE tipo = 'ricerca' AND src IN ('ig-ads','ig-dm') ORDER BY id")
      .all();
    expect(righe.results).toEqual([
      { dettaglio: "completa", src: "ig-ads" },
      { dettaglio: "cache", src: "ig-dm" },
    ]);
  });

  it("forzaLeggera (Turnstile irraggiungibile) → leggera senza checkSpesa né Apify", async () => {
    const d = deps();
    expect(tipi(await esegui(richiesta({ forzaLeggera: true }), d))).toEqual(["capito", "risultati:leggera", "salvato"]);
    expect(d.checkSpesa).not.toHaveBeenCalled();
  });

  it("Altre idee: esclude gli ASIN già mostrati e non usa la cache richieste", async () => {
    const d = deps();
    const ev = await esegui(richiesta({ escludi: ["A000000001", "A000000002"] }), d);
    const ris = ev[1] as Extract<EventoSSE, { tipo: "risultati"; modalita: "completa" }>;
    expect(ris.scelte.map((s) => s.asin)).toEqual(["A000000003", "A000000004"]);
  });

  it("errore imprevisto in scegli → scelta di riserva, mai pagina senza risultati", async () => {
    const d = deps({ scegli: vi.fn(async () => { throw new Error("imprevisto"); }) });
    const ev = await esegui(richiesta(), d);
    expect(tipi(ev)).toEqual(["capito", "risultati:completa", "salvato"]);
    const ris = ev[1] as Extract<EventoSSE, { tipo: "risultati"; modalita: "completa" }>;
    expect(ris.scelte).toHaveLength(3);
    expect(ris.scelte.every((s) => s.perche === null)).toBe(true);
  });

  it("D1 non disponibile → risultati comunque, senza evento salvato", async () => {
    const dbRotto = { prepare: () => { throw new Error("D1 giù"); }, batch: () => { throw new Error("D1 giù"); } } as unknown as D1Database;
    expect(tipi(await esegui(richiesta(), deps({ db: dbRotto })))).toEqual(["capito", "risultati:completa"]);
  });
});
