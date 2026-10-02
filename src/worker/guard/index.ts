import { registraEvento } from "../store/eventi";
import { sicuro } from "../store/sicuro";
import { difesaQuotaIp, difesaQuotaVisitatore, difesaTettoGlobale } from "./quota";
import type { ContestoGuard, Difesa, Esito } from "./tipi";
import { difesaTurnstile } from "./turnstile";
import { difesaVelocita } from "./velocita";

async function esegui(difese: [string, Difesa][], ctx: ContestoGuard, registra: boolean): Promise<Esito> {
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
    if (registra) {
      await sicuro(() => registraEvento(ctx.db, { tipo: "blocco", difesa: nome, dettaglio, src: ctx.src }, ctx.now()));
    } else {
      // Blocchi d'accesso solo nei log: una raffica di bot non deve consumare le scritture D1.
      console.log(`blocco ${nome}: ${dettaglio}`);
    }
    return esito;
  }
  return "procedi";
}

/** Prima di tutto: ferma raffiche e bot prima di cache e AI. */
export function checkAccesso(ctx: ContestoGuard): Promise<Esito> {
  return esegui([["velocita", difesaVelocita], ["turnstile", difesaTurnstile]], ctx, false);
}

/** Subito prima di Apify: le risposte dalla cache non consumano quota. */
export function checkSpesa(ctx: ContestoGuard): Promise<Esito> {
  return esegui([["quota_ip", difesaQuotaIp], ["quota_visitatore", difesaQuotaVisitatore], ["tetto_globale", difesaTettoGlobale]], ctx, true);
}
