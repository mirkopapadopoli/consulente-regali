/** Parser incrementale di text/event-stream: chiama onData per ogni evento completo. */
export function creaParserSSE(onData: (data: string) => void): (chunk: string) => void {
  let buffer = "";
  return (chunk: string) => {
    buffer += chunk.replace(/\r\n/g, "\n");
    let fine: number;
    while ((fine = buffer.indexOf("\n\n")) >= 0) {
      const blocco = buffer.slice(0, fine);
      buffer = buffer.slice(fine + 2);
      const data = blocco
        .split("\n")
        .filter((riga) => riga.startsWith("data:"))
        .map((riga) => riga.slice(5).replace(/^ /, ""))
        .join("\n");
      if (data) onData(data);
    }
  };
}
