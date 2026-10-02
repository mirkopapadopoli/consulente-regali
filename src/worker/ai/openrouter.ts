export class ErroreAI extends Error {}

export interface OpzioniChat {
  apiKey: string;
  model: string;
  timeoutMs: number;
  fetch?: typeof fetch;
}

export type Chat = (system: string, user: string) => Promise<unknown>;

export function estraiJson(testo: string): unknown {
  const s = testo.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(s);
  } catch {
    throw new ErroreAI("JSON non valido");
  }
}

export async function chatJson(o: OpzioniChat, system: string, user: string): Promise<unknown> {
  const f = o.fetch ?? ((i: RequestInfo | URL, init?: RequestInit) => fetch(i, init));
  let res: Response;
  try {
    res = await f("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${o.apiKey}`, "Content-Type": "application/json", "X-Title": "cosaregalo" },
      body: JSON.stringify({
        model: o.model,
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        reasoning: { enabled: false },
      }),
      signal: AbortSignal.timeout(o.timeoutMs),
    });
  } catch (e) {
    throw new ErroreAI(`rete o timeout: ${String(e)}`);
  }
  if (!res.ok) throw new ErroreAI(`HTTP ${res.status}`);
  let dati: { choices?: { message?: { content?: string } }[] };
  try {
    // Il timeout può scattare anche mentre si legge il corpo, non solo durante fetch().
    dati = (await res.json()) as typeof dati;
  } catch (e) {
    throw new ErroreAI(`lettura risposta fallita: ${String(e)}`);
  }
  return estraiJson(dati.choices?.[0]?.message?.content ?? "");
}
