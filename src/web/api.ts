import type { EventoSSE, RisultatoPubblico } from "../shared/types";
import { creaParserSSE } from "./sse";

export interface ConfigPubblica {
  turnstileSiteKey: string;
  affiliateTag: string;
  webAnalyticsToken: string;
}

export async function getConfig(): Promise<ConfigPubblica> {
  const res = await fetch("/api/config");
  return (await res.json()) as ConfigPubblica;
}

export async function cerca(
  body: { testo: string; turnstileToken: string; src: string | null; escludi: string[] },
  onEvento: (e: EventoSSE) => void,
): Promise<void> {
  const res = await fetch("/api/cerca", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    onEvento(res.status === 400 ? { tipo: "non_capito" } : { tipo: "errore" });
    return;
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  const parse = creaParserSSE((data) => {
    try {
      onEvento(JSON.parse(data) as EventoSSE);
    } catch {
      /* evento malformato: ignorato */
    }
  });
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    parse(value);
  }
}

export async function leggiRisultatoPubblico(id: string): Promise<RisultatoPubblico | null> {
  const res = await fetch(`/api/risultati/${encodeURIComponent(id)}`);
  return res.ok ? ((await res.json()) as RisultatoPubblico) : null;
}

/** Misurazione: se fallisce si perde il conteggio, mai la commissione (link diretti). */
export function inviaEvento(e: { tipo: "click" | "carrello" | "condivisione"; asin?: string; risultatoId?: string | null; src?: string | null }): void {
  const payload = JSON.stringify({ ...e, risultatoId: e.risultatoId ?? undefined, src: e.src ?? undefined });
  try {
    if (!navigator.sendBeacon?.("/api/evento", new Blob([payload], { type: "application/json" }))) {
      void fetch("/api/evento", { method: "POST", body: payload, keepalive: true });
    }
  } catch {
    /* ignorato */
  }
}

export function leggiSrc(): string | null {
  try {
    const dalLink = new URLSearchParams(location.search).get("src");
    if (dalLink) sessionStorage.setItem("src", dalLink);
    return dalLink ?? sessionStorage.getItem("src");
  } catch {
    return null;
  }
}
