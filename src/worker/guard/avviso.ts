export function creaAvvisoTelegram(token: string | undefined, chatId: string | undefined, f: typeof fetch) {
  return async (msg: string): Promise<void> => {
    if (!token || !chatId) return;
    try {
      await f(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    } catch (e) {
      console.error("avviso Telegram fallito", e);
    }
  };
}
