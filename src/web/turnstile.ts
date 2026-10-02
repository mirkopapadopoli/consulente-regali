interface TurnstileApi {
  render(el: HTMLElement, opzioni: Record<string, unknown>): string;
  execute(id: string): void;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

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
  return new Promise<string>((ok) => {
    const id = ts.render(contenitore, {
      sitekey,
      appearance: "interaction-only",
      execution: "execute",
      callback: (token: string) => {
        ok(token);
        setTimeout(() => ts.remove(id), 0);
      },
      "error-callback": () => {
        ok("");
        setTimeout(() => ts.remove(id), 0);
      },
    });
    ts.execute(id);
  });
}
