import { describe, expect, it } from "vitest";
import { isAndroid, isInstagram } from "../../src/web/ambiente";

const IG_ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Instagram 312.0.0.0 Android";
const IG_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 312.0.0";
const SAFARI = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

describe("ambiente", () => {
  it("riconosce il browser interno di Instagram", () => {
    expect(isInstagram(IG_ANDROID)).toBe(true);
    expect(isInstagram(IG_IOS)).toBe(true);
    expect(isInstagram(SAFARI)).toBe(false);
  });
  it("riconosce Android", () => {
    expect(isAndroid(IG_ANDROID)).toBe(true);
    expect(isAndroid(IG_IOS)).toBe(false);
  });
});
