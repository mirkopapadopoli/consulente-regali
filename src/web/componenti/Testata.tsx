import { useEffect, useState } from "preact/hooks";
import { Icona } from "./Icona";

function vaiAlCampo() {
  const campo = document.getElementById("richiesta") as HTMLTextAreaElement | null;
  campo?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => campo?.focus(), 350);
}

/** Barra fissa in stile The Verge. In home il wordmark piccolo compare solo dopo aver superato quello gigante. */
export function Testata({ inHome }: { inHome: boolean }) {
  const [oltreApertura, setOltreApertura] = useState(!inHome);

  useEffect(() => {
    if (!inHome) {
      setOltreApertura(true);
      return;
    }
    const gigante = document.querySelector(".marchio-gigante");
    if (!gigante || !("IntersectionObserver" in window)) {
      setOltreApertura(true);
      return;
    }
    const osservatore = new IntersectionObserver(([voce]) => setOltreApertura(!voce.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    osservatore.observe(gigante);
    return () => osservatore.disconnect();
  }, [inHome]);

  return (
    <header class="nav nav-fissa">
      <a class={`nav-marchio ${oltreApertura ? "" : "nav-marchio-nascosto"}`} href="/" tabIndex={oltreApertura ? 0 : -1}>
        cosaregalo
      </a>
      {inHome ? (
        <nav class="nav-link" aria-label="Sezioni">
          <a href="#come-funziona">Come funziona</a>
          <a href="#occasioni">Occasioni</a>
        </nav>
      ) : null}
      <button type="button" class="pillola-nav" onClick={vaiAlCampo}>
        Trova un regalo <Icona nome="freccia" />
      </button>
    </header>
  );
}
