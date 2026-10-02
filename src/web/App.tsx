import { useEffect, useState } from "preact/hooks";
import { ID_RE } from "../shared/testo";
import { type ConfigPubblica, getConfig } from "./api";
import { Consulente } from "./componenti/Consulente";
import { PaginaCondivisa } from "./componenti/PaginaCondivisa";

export function App() {
  const [config, setConfig] = useState<ConfigPubblica | null>(null);
  useEffect(() => {
    getConfig().then(setConfig).catch(() => setConfig({ turnstileSiteKey: "", affiliateTag: "mirkopapadopo-21" }));
  }, []);
  if (!config) return null;
  const condiviso = location.pathname.match(/^\/r\/([^/]+)\/?$/);
  if (condiviso) return <PaginaCondivisa id={ID_RE.test(condiviso[1]) ? condiviso[1] : "--------"} config={config} />;
  return <Consulente config={config} />;
}
