import { ottieniTokenDa, type TurnstileApi } from "./ricerca";

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TIMEOUT_TOKEN_MS = 15000;

let caricamento: Promise<void> | null = null;

function carica(): Promise<void> {
  caricamento ??= new Promise<void>((ok, ko) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => {
      caricamento = null;
      ko(new Error("turnstile non caricato"));
    };
    document.head.appendChild(s);
  });
  return caricamento;
}

/** Token monouso; stringa vuota se Turnstile non è disponibile (il server risponderà "bloccato"). */
export async function ottieniToken(contenitore: HTMLElement, sitekey: string): Promise<string> {
  try {
    await carica();
  } catch {
    return "";
  }
  const ts = window.turnstile;
  if (!ts) return "";
  return ottieniTokenDa(ts, contenitore, sitekey, TIMEOUT_TOKEN_MS);
}
