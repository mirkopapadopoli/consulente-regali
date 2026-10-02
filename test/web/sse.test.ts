import { describe, expect, it } from "vitest";
import { creaParserSSE } from "../../src/web/sse";

describe("creaParserSSE", () => {
  it("ricompone eventi spezzati tra chunk e ignora righe non data", () => {
    const dati: string[] = [];
    const parse = creaParserSSE((d) => dati.push(d));
    parse('data: {"tipo":"cap');
    parse('ito"}\n\nevent: x\ndata: {"tipo":"errore"}\r\n\r\n');
    parse("data: incompleto");
    expect(dati).toEqual(['{"tipo":"capito"}', '{"tipo":"errore"}']);
  });
});
