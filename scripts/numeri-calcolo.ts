// Calcoli di `npm run numeri`, separati dall'I/O per poterli testare.

export interface RigaEvento {
  src: string | null;
  tipo: string;
  n: number;
}

export interface Canale {
  canale: string;
  ricerche: number;
  click: number;
  carrello: number;
  condivisioni: number;
  clickPerRicerca: string;
}

export interface Visite {
  totale: number;
  perProvenienza: { provenienza: string; visite: number }[];
}

/** Giorni da guardare: intero 1–365 (finisce in una query SQL). */
export function giorniValidi(v: string | undefined): number {
  if (v === undefined) return 7;
  if (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 365) throw new Error(`Giorni non validi: "${v}". Usa un numero da 1 a 365.`);
  return Number(v);
}

const CAMPI = { ricerca: "ricerche", click: "click", carrello: "carrello", condivisione: "condivisioni" } as const;

function percentuale(click: number, ricerche: number): string {
  return ricerche ? `${Math.round((click / ricerche) * 100)}%` : "–";
}

/** Eventi per canale (`src`), il più usato in alto, totale in fondo. I blocchi delle difese non contano. */
export function riepilogo(righe: RigaEvento[]): Canale[] {
  const per = new Map<string, Canale>();
  const vuoto = (canale: string): Canale => ({ canale, ricerche: 0, click: 0, carrello: 0, condivisioni: 0, clickPerRicerca: "–" });
  for (const r of righe) {
    const campo = CAMPI[r.tipo as keyof typeof CAMPI];
    if (!campo) continue;
    const nome = r.src ?? "diretto";
    const c = per.get(nome) ?? vuoto(nome);
    c[campo] += r.n;
    per.set(nome, c);
  }
  const canali = [...per.values()].sort((a, b) => b.ricerche - a.ricerche || b.click - a.click);
  const totale = canali.reduce((t, c) => {
    for (const campo of Object.values(CAMPI)) t[campo] += c[campo];
    return t;
  }, vuoto("totale"));
  return [...canali, totale].map((c) => ({ ...c, clickPerRicerca: percentuale(c.click, c.ricerche) }));
}

/** Risposta GraphQL di Web Analytics → visite totali e per sito di provenienza. */
export function visiteDaGraphql(json: {
  data: { viewer: { accounts: { rumPageloadEventsAdaptiveGroups: { sum: { visits: number }; dimensions: { refererHost: string } }[] }[] } } | null;
  errors: { message: string }[] | null;
}): Visite {
  if (json.errors?.length || !json.data) throw new Error(`Web Analytics: ${json.errors?.map((e) => e.message).join("; ") ?? "risposta vuota"}`);
  const gruppi = json.data.viewer.accounts[0]?.rumPageloadEventsAdaptiveGroups ?? [];
  const perProvenienza = gruppi
    .map((g) => ({ provenienza: g.dimensions.refererHost || "diretto", visite: g.sum.visits }))
    .sort((a, b) => b.visite - a.visite);
  return { totale: perProvenienza.reduce((t, p) => t + p.visite, 0), perProvenienza };
}

/** Testo da stampare nel terminale. */
export function tabella(canali: Canale[], giorni: number, visite: Visite | null): string {
  const righe: string[] = [`cosaregalo · ultimi ${giorni} giorni`, ""];
  if (visite) {
    righe.push(`Visite: ${visite.totale}`);
    for (const p of visite.perProvenienza.slice(0, 8)) righe.push(`  ${p.provenienza.padEnd(28)}${String(p.visite).padStart(6)}`);
  } else {
    righe.push("Visite: non disponibili (attiva Web Analytics e le variabili CF_*, vedi docs/statistiche.md)");
  }
  righe.push("", `${"canale".padEnd(14)}${"ricerche".padStart(9)}${"click".padStart(7)}${"carrello".padStart(9)}${"condiv.".padStart(8)}${"click/ric.".padStart(11)}`);
  for (const c of canali) {
    if (c.canale === "totale") righe.push("-".repeat(58));
    righe.push(
      `${c.canale.padEnd(14)}${String(c.ricerche).padStart(9)}${String(c.click).padStart(7)}${String(c.carrello).padStart(9)}${String(c.condivisioni).padStart(8)}${c.clickPerRicerca.padStart(11)}`,
    );
  }
  return righe.join("\n");
}
