import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrationsPath = fileURLToPath(new URL("./migrations", import.meta.url));

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(migrationsPath),
          APIFY_TOKEN: "test-apify",
          OPENROUTER_API_KEY: "test-openrouter",
          TURNSTILE_SECRET: "test-turnstile",
          VISITOR_SALT: "test-salt",
          TELEGRAM_BOT_TOKEN: "test-telegram",
          TELEGRAM_CHAT_ID: "1",
        },
      },
    })),
  ],
  test: {
    setupFiles: ["./test/apply-migrations.ts"],
  },
});
