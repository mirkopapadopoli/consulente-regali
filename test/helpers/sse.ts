import type { EventoSSE } from "../../src/shared/types";

export async function leggiEventi(res: Response): Promise<EventoSSE[]> {
  const testo = await res.text();
  return testo
    .split("\n\n")
    .map((blocco) => blocco.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n"))
    .filter((d) => d !== "")
    .map((d) => JSON.parse(d) as EventoSSE);
}
