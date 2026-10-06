// `npm run numeri [-- giorni]`: eventi del sito da D1 (produzione) + visite da Cloudflare Web Analytics, per canale.
import { execFileSync } from "node:child_process";
import { giorniValidi, type RigaEvento, riepilogo, tabella, type Visite, visiteDaGraphql } from "./numeri-calcolo.ts";

const giorni = giorniValidi(process.argv[2]);
const dal = new Date(Date.now() - giorni * 86_400_000).toISOString().slice(0, 10);

function eventi(): RigaEvento[] {
  const sql = `SELECT src, tipo, COUNT(*) AS n FROM eventi WHERE quando >= '${dal}' GROUP BY src, tipo`;
  const out = execFileSync("npx", ["wrangler", "d1", "execute", "consulente-regali", "--remote", "--json", "--command", sql], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(out)[0].results as RigaEvento[];
}

/** Visite da Web Analytics via GraphQL; null se le credenziali non sono impostate (vedi docs/statistiche.md). */
async function visite(): Promise<Visite | null> {
  const { CLOUDFLARE_API_TOKEN: token, CF_ACCOUNT_ID: account, CF_WEB_ANALYTICS_SITE_TAG: sito } = process.env;
  if (!token || !account || !sito) return null;
  const query = `query ($account: string!, $sito: string!, $dal: Date!) {
    viewer { accounts(filter: { accountTag: $account }) {
      rumPageloadEventsAdaptiveGroups(limit: 100, filter: { siteTag: $sito, date_geq: $dal }) {
        sum { visits }
        dimensions { refererHost }
      }
    } }
  }`;
  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { account, sito, dal } }),
  });
  if (!res.ok) throw new Error(`Web Analytics: HTTP ${res.status}`);
  return visiteDaGraphql(await res.json());
}

const v = await visite().catch((e: Error) => {
  console.error(`(${e.message}: mostro solo gli eventi del sito)\n`);
  return null;
});
console.log(tabella(riepilogo(eventi()), giorni, v));
