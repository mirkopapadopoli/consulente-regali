import { ASIN_RE } from "./testo";

const BASE = "https://www.amazon.it";

function asinValido(asin: string): string {
  if (!ASIN_RE.test(asin)) throw new Error(`ASIN non valido: ${asin}`);
  return asin;
}

export function linkProdotto(asin: string, tag: string): string {
  return `${BASE}/dp/${asinValido(asin)}?tag=${encodeURIComponent(tag)}`;
}

export function linkCarrello(asin: string, tag: string): string {
  return `${BASE}/gp/aws/cart/add.html?ASIN.1=${asinValido(asin)}&Quantity.1=1&tag=${encodeURIComponent(tag)}`;
}

export function linkRicerca(query: string, tag: string): string {
  return `${BASE}/s?k=${encodeURIComponent(query.trim())}&tag=${encodeURIComponent(tag)}`;
}

/** Android dentro il browser di Instagram: apre l'app Amazon mantenendo il tag. */
export function linkIntentAndroid(asin: string, tag: string): string {
  const https = linkProdotto(asin, tag);
  return (
    `intent://www.amazon.it/dp/${asinValido(asin)}?tag=${encodeURIComponent(tag)}` +
    `#Intent;scheme=https;package=com.amazon.mShop.android.shopping;` +
    `S.browser_fallback_url=${encodeURIComponent(https)};end`
  );
}
