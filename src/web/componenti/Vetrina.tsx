import { Icona } from "./Icona";

const DESTINATARI = [
  "Per la mamma",
  "Per il papà",
  "Per il capo",
  "Per l'amico segreto",
  "Per la nonna",
  "Per chi ha tutto",
  "Per il collega",
  "Per lei",
  "Per lui",
  "Per i bambini",
];

const PASSI = [
  { n: "01", titolo: "Scrivi per chi è", testo: "Una frase basta: chi è, cosa ama, quanto vuoi spendere.", colore: "menta" },
  { n: "02", titolo: "Cerco su Amazon", testo: "Trasformo la richiesta in tre ricerche e leggo i prodotti veri, con prezzi e recensioni.", colore: "viola" },
  { n: "03", titolo: "Scegli il regalo", testo: "Ti propongo tre regali, ognuno con il motivo per cui è adatto a quella persona.", colore: "giallo" },
];

const OCCASIONI = [
  { nome: "Natale", inizio: "Regalo di Natale per " },
  { nome: "Compleanno", inizio: "Regalo di compleanno per " },
  { nome: "Amico segreto", inizio: "Amico segreto in ufficio, " },
  { nome: "San Valentino", inizio: "San Valentino per " },
  { nome: "Festa della mamma", inizio: "Festa della mamma, mia mamma ama " },
  { nome: "Anniversario", inizio: "Anniversario con " },
];

/** Fascia scorrevole con i destinatari tipici: energia da testata, contenuto vero. */
export function Nastro() {
  const voci = [...DESTINATARI, ...DESTINATARI];
  return (
    <div class="nastro" aria-hidden="true">
      <div class="nastro-scorre">
        {voci.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>
    </div>
  );
}

export function ComeFunziona() {
  return (
    <section class="sezione" aria-labelledby="come-funziona">
      <h2 class="sezione-titolo" id="come-funziona">
        Come funziona
      </h2>
      <ol class="passi">
        {PASSI.map((p) => (
          <li class={`passo passo-${p.colore}`} key={p.n}>
            <span class="passo-numero">{p.n}</span>
            <h3 class="passo-titolo">{p.titolo}</h3>
            <p class="passo-testo">{p.testo}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Occasioni({ onScegli }: { onScegli: (inizio: string) => void }) {
  return (
    <section class="sezione" aria-labelledby="occasioni">
      <h2 class="sezione-titolo" id="occasioni">
        Per ogni occasione
      </h2>
      <ul class="occasioni">
        {OCCASIONI.map((o) => (
          <li key={o.nome}>
            <button type="button" class="occasione" onClick={() => onScegli(o.inizio)}>
              <span class="occasione-nome">{o.nome}</span>
              <Icona nome="freccia" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Invito({ onInizia }: { onInizia: () => void }) {
  return (
    <section class="invito">
      <p class="invito-titolo">Non sai ancora cosa regalare?</p>
      <p class="invito-testo">Scrivi una frase: in pochi secondi hai tre idee vere tra cui scegliere.</p>
      <button type="button" class="pillola-chiara" onClick={onInizia}>
        Inizia ora <Icona nome="freccia" />
      </button>
    </section>
  );
}
