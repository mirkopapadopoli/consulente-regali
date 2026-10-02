/** Esegue un'operazione non essenziale (D1): in caso di errore logga e restituisce null. */
export async function sicuro<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error("operazione D1 fallita", e);
    return null;
  }
}
