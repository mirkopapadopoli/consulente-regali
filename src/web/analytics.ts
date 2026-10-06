const BEACON = "https://static.cloudflareinsights.com/beacon.min.js";

/** Script di Cloudflare Web Analytics (senza cookie) per il token dato; null se il token non è impostato. */
export function beaconAnalytics(token: string): { src: string; dati: string } | null {
  const t = token.trim();
  return t ? { src: BEACON, dati: JSON.stringify({ token: t }) } : null;
}

/** Carica il beacon una sola volta: conta visite, pagine e provenienza. */
export function attivaAnalytics(token: string): void {
  const b = beaconAnalytics(token);
  if (!b || document.querySelector(`script[src="${b.src}"]`)) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = b.src;
  s.setAttribute("data-cf-beacon", b.dati);
  document.head.appendChild(s);
}
