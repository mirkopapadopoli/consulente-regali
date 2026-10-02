import { Hono } from "hono";
import type { Env } from "./env";

export const app = new Hono<{ Bindings: Env }>();

app.get("/api/salute", (c) => c.json({ ok: true }));

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
