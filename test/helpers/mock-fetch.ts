import { vi } from "vitest";

export function mockFetch(gestore: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    return gestore(url, init);
  });
}
