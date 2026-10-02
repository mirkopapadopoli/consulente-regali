import { registraEvento } from "../store/eventi";
import { sicuro } from "../store/sicuro";
import { difesaQuotaVisitatore, difesaTettoGlobale } from "./quota";
import type { ContestoGuard, Difesa, Esito } from "./tipi";
import { difesaTurnstile } from "./turnstile";
import { difesaVelocita } from "./velocita";

async function esegui(difese: [string, Difesa][], ctx: ContestoGuard): Promise<Esito> {
  for (const [nome, difesa] of difese) {
    let esito: Esito;
    try {
      esito = await difesa(ctx);
    } catch (e) {
      // D1 o binding non disponibili: si procede, i tetti nei pannelli restano la garanzia (spec §10.1).
      console.error(`difesa ${nome} non eseguibile`, e);
      continue;
    }
    if (esito === "procedi") continue;
    const dettaglio = typeof esito === "object" ? esito.blocca : "leggera";
    await sicuro(() => registraEvento(ctx.db, { tipo: "blocco", difesa: nome, dettaglio, src: ctx.src }, ctx.now()));
    return esito;
  }
  return "procedi";
}

/** Prima di tutto: ferma raffiche e bot prima di cache e AI. */
export function checkAccesso(ctx: ContestoGuard): Promise<Esito> {
  return esegui([["velocita", difesaVelocita], ["turnstile", difesaTurnstile]], ctx);
}

/** Subito prima di Apify: le risposte dalla cache non consumano quota. */
export function checkSpesa(ctx: ContestoGuard): Promise<Esito> {
  return esegui([["quota_visitatore", difesaQuotaVisitatore], ["tetto_globale", difesaTettoGlobale]], ctx);
}
