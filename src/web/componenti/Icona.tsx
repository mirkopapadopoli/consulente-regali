// Icone disegnate a mano, tratto 1.5 su griglia 20: un solo peso per tutta la pagina.
const TRACCIATI = {
  freccia: "M5 10h10M11 6l4 4-4 4",
  esterno: "M8 4H4.75v11.25H16V12M11 4h5v5M16 4l-7 7",
  carrello: "M3 4h2l1.6 8.2a1 1 0 0 0 1 .8h7.2a1 1 0 0 0 1-.76L17 7H6M8.5 16.5h.01M14.5 16.5h.01",
  condividi: "M10 13V3.5M6.5 7 10 3.5 13.5 7M4.5 11v4.75h11V11",
  schermo: "M3 4.5h14v9H3zM7.5 16.5h5M10 13.5v3",
  rinnova: "M15.5 8A6 6 0 1 0 16 11M15.5 3.5V8H11",
  lente: "M8.75 14.5a5.75 5.75 0 1 0 0-11.5 5.75 5.75 0 0 0 0 11.5ZM13 13l4 4",
  avviso: "M10 6.5v4.5M10 14h.01M10 2.5 18 17H2Z",
} as const;

export type NomeIcona = keyof typeof TRACCIATI;

export function Icona({ nome, class: classe = "icona" }: { nome: NomeIcona; class?: string }) {
  return (
    <svg class={classe} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d={TRACCIATI[nome]} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" />
    </svg>
  );
}
