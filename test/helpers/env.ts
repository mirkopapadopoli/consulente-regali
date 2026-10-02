import { env } from "cloudflare:workers";
import type { D1Migration } from "cloudflare:test";
import type { Env } from "../../src/worker/env";

export type TestEnv = Env & { TEST_MIGRATIONS: D1Migration[] };

export function testEnv(): TestEnv {
  return env as unknown as TestEnv;
}
