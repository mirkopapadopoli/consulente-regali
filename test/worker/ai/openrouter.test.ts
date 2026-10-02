import { describe, expect, it, vi } from "vitest";
import { chatJson, ErroreAI, estraiJson } from "../../../src/worker/ai/openrouter";

function risposta(content: string, status = 200) {
  return vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) =>
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status }));
}

const base = { apiKey: "k", model: "deepseek/deepseek-v4.1-flash", timeoutMs: 6000 };

describe("chatJson", () => {
  it("invia modello, messaggi, JSON mode e ragionamento disattivato", async () => {
    const f = risposta('{"ok":true}');
    expect(await chatJson({ ...base, fetch: f }, "SYS", "USER")).toEqual({ ok: true });
    const [url, init] = f.mock.calls[0];
    expect(String(url)).toBe("https://openrouter.ai/api/v1/chat/completions");
    const body = JSON.parse(String(init!.body));
    expect(body).toMatchObject({
      model: "deepseek/deepseek-v4.1-flash", temperature: 0.4,
      response_format: { type: "json_object" }, reasoning: { enabled: false },
      messages: [{ role: "system", content: "SYS" }, { role: "user", content: "USER" }],
    });
    expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer k");
  });
  it("lancia ErroreAI su HTTP non ok, su rete in errore e su JSON non valido", async () => {
    await expect(chatJson({ ...base, fetch: risposta("{}", 500) }, "s", "u")).rejects.toBeInstanceOf(ErroreAI);
    await expect(chatJson({ ...base, fetch: vi.fn(async () => { throw new Error("rete"); }) }, "s", "u")).rejects.toBeInstanceOf(ErroreAI);
    await expect(chatJson({ ...base, fetch: risposta("non json") }, "s", "u")).rejects.toBeInstanceOf(ErroreAI);
  });
});

describe("chatJson: errori durante la lettura del corpo", () => {
  it("un timeout mentre si legge la risposta diventa ErroreAI", async () => {
    const corpoInterrotto = new ReadableStream({
      start(c) {
        c.error(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
      },
    });
    const f = vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) => new Response(corpoInterrotto, { status: 200 }));
    await expect(chatJson({ ...base, fetch: f }, "s", "u")).rejects.toBeInstanceOf(ErroreAI);
  });
  it("una risposta HTTP 200 non JSON diventa ErroreAI", async () => {
    const f = vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) => new Response("<html>gateway</html>", { status: 200 }));
    await expect(chatJson({ ...base, fetch: f }, "s", "u")).rejects.toBeInstanceOf(ErroreAI);
  });
});

describe("estraiJson", () => {
  it("accetta JSON racchiuso in blocchi ```json", () => {
    expect(estraiJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
});
