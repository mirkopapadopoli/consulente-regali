export interface TurnstileApi {
  render(el: HTMLElement, opzioni: Record<string, unknown>): string;
  execute(id: string): void;
  remove(id: string): void;
}

/** Token monouso; "" se il widget fallisce, scade, non è supportato o non risponde entro timeoutMs. */
export function ottieniTokenDa(ts: TurnstileApi, contenitore: HTMLElement, sitekey: string, timeoutMs: number): Promise<string> {
  return new Promise<string>((ok) => {
    let id: string | null = null;
    let finito = false;
    const chiudi = (token: string) => {
      if (finito) return;
      finito = true;
      clearTimeout(timer);
      ok(token);
      if (id !== null) {
        const daRimuovere = id;
        setTimeout(() => {
          try {
            ts.remove(daRimuovere);
          } catch {
            /* widget già rimosso */
          }
        }, 0);
      }
    };
    const timer = setTimeout(() => chiudi(""), timeoutMs);
    try {
      id = ts.render(contenitore, {
        sitekey,
        appearance: "interaction-only",
        execution: "execute",
        callback: (token: string) => chiudi(token),
        "error-callback": () => chiudi(""),
        "timeout-callback": () => chiudi(""),
        "expired-callback": () => chiudi(""),
        "unsupported-callback": () => chiudi(""),
      });
      ts.execute(id);
    } catch {
      chiudi("");
    }
  });
}

/** Qualunque cosa succeda, la pagina esce dallo stato "Sto cercando…". */
export async function avviaRicercaSicura(d: {
  ottieniToken: () => Promise<string>;
  cerca: (token: string) => Promise<void>;
  errore: () => void;
  fine: () => void;
}): Promise<void> {
  try {
    const token = await d.ottieniToken();
    await d.cerca(token);
  } catch {
    d.errore();
  } finally {
    d.fine();
  }
}
