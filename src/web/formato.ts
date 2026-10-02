const EURO = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const ORA = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });
const DATA = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "long" });

export const euro = (n: number) => EURO.format(n);
export const oraRoma = (iso: string) => ORA.format(new Date(iso));
export const dataRoma = (iso: string) => DATA.format(new Date(iso));
