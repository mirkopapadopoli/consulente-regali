import { describe, expect, it } from "vitest";
import { linkCarrello, linkIntentAndroid, linkProdotto, linkRicerca } from "../../src/shared/affiliate";

const TAG = "mirkopapadopo-21";

describe("link affiliati", () => {
  it("linkProdotto usa il formato canonico /dp/ con il tag", () => {
    const u = new URL(linkProdotto("B0CQTF5Y1R", TAG));
    expect(u.origin).toBe("https://www.amazon.it");
    expect(u.pathname).toBe("/dp/B0CQTF5Y1R");
    expect(u.searchParams.get("tag")).toBe(TAG);
  });

  it("linkCarrello usa add-to-cart con ASIN, quantità e tag", () => {
    const u = new URL(linkCarrello("B0CQTF5Y1R", TAG));
    expect(u.pathname).toBe("/gp/aws/cart/add.html");
    expect(u.searchParams.get("ASIN.1")).toBe("B0CQTF5Y1R");
    expect(u.searchParams.get("Quantity.1")).toBe("1");
    expect(u.searchParams.get("tag")).toBe(TAG);
  });

  it("linkRicerca codifica spazi e accenti e conserva il tag", () => {
    const u = new URL(linkRicerca("  macinacaffè manuale & co ", TAG));
    expect(u.pathname).toBe("/s");
    expect(u.searchParams.get("k")).toBe("macinacaffè manuale & co");
    expect(u.searchParams.get("tag")).toBe(TAG);
  });

  it("linkIntentAndroid apre l'app Amazon e ha come fallback il link /dp/ con tag", () => {
    const l = linkIntentAndroid("B0CQTF5Y1R", TAG);
    expect(l.startsWith("intent://www.amazon.it/dp/B0CQTF5Y1R?tag=mirkopapadopo-21#Intent;")).toBe(true);
    expect(l).toContain("scheme=https;");
    expect(l).toContain("package=com.amazon.mShop.android.shopping;");
    const fallback = decodeURIComponent(l.match(/S\.browser_fallback_url=([^;]+);/)![1]);
    expect(fallback).toBe(linkProdotto("B0CQTF5Y1R", TAG));
    expect(l.endsWith(";end")).toBe(true);
  });

  it("rifiuta ASIN non validi invece di produrre link rotti", () => {
    expect(() => linkProdotto("abc", TAG)).toThrow();
    expect(() => linkCarrello("B0CQTF5Y1R/../x", TAG)).toThrow();
    expect(() => linkIntentAndroid("", TAG)).toThrow();
  });
});
