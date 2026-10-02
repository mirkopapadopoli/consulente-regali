import type { MotivoBlocco } from "../../shared/types";
import type { Config } from "../config";
import type { RateLimiter } from "../env";

export type Esito = "procedi" | "leggera" | { blocca: MotivoBlocco };

export interface ContestoGuard {
  cfg: Config;
  db: D1Database;
  rateLimiter: RateLimiter;
  ip: string;
  /** hash(IP + sale + giorno): conta le ricerche per IP senza salvare l'IP. */
  ipHash: string;
  visitatore: string;
  turnstileToken: string;
  turnstileSecret: string;
  src: string | null;
  fetch: typeof fetch;
  now: () => Date;
  avvisa: (msg: string) => Promise<void>;
  waitUntil: (p: Promise<unknown>) => void;
}

export type Difesa = (ctx: ContestoGuard) => Promise<Esito>;
