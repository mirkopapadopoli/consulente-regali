import { useEffect, useState } from "preact/hooks";
import { ID_RE } from "../shared/testo";
import { attivaAnalytics, primaVisita } from "./analytics";
import { type ConfigPubblica, getConfig, inviaEvento, leggiSrc } from "./api";
import { Consulente } from "./componenti/Consulente";
import { PaginaCondivisa } from "./componenti/PaginaCondivisa";

export function App() {
  const [config, setConfig] = useState<ConfigPubblica | null>(null);
  useEffect(() => {
    if (primaVisita(sessionStorage)) {
      inviaEvento({ tipo: "visita", pagina: location.pathname.startsWith("/r/") ? "condivisa" : "home", src: leggiSrc() });
    }
    getConfig()
      .then((c) => {
        setConfig(c);
        attivaAnalytics(c.webAnalyticsToken);
      })
      .catch(() => setConfig({ turnstileSiteKey: "", affiliateTag: "mirkopapadopo-21", webAnalyticsToken: "" }));
  }, []);
  if (!config) return null;
  const condiviso = location.pathname.match(/^\/r\/([^/]+)\/?$/);
  if (condiviso) return <PaginaCondivisa id={ID_RE.test(condiviso[1]) ? condiviso[1] : "--------"} config={config} />;
  return <Consulente config={config} />;
}
