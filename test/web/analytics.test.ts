import { describe, expect, it } from "vitest";
import { beaconAnalytics } from "../../src/web/analytics";

describe("beaconAnalytics", () => {
  it("nessuno script senza token: niente misurazione finché non è configurata", () => {
    expect(beaconAnalytics("")).toBeNull();
    expect(beaconAnalytics("   ")).toBeNull();
  });

  it("script Cloudflare Web Analytics con il token", () => {
    expect(beaconAnalytics("abc123")).toEqual({
      src: "https://static.cloudflareinsights.com/beacon.min.js",
      dati: '{"token":"abc123"}',
    });
  });
});
