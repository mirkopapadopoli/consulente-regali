import { applyD1Migrations } from "cloudflare:test";
import { testEnv } from "./helpers/env";

await applyD1Migrations(testEnv().DB, testEnv().TEST_MIGRATIONS);
