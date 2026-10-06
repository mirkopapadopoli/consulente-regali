export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  DB: D1Database;
  RATE_LIMITER: RateLimiter;
  EVENTI_LIMITER: RateLimiter;
  // vars (stringhe da wrangler.jsonc, modificabili dal pannello)
  AI_MODEL?: string;
  AI_TIMEOUT_MS?: string;
  APIFY_ACTOR?: string;
  APIFY_RISULTATI_PER_RICERCA?: string;
  APIFY_TIMEOUT_MS?: string;
  MIN_STELLE?: string;
  MIN_RECENSIONI?: string;
  QUOTA_VISITATORE?: string;
  QUOTA_IP?: string;
  TETTO_GIORNALIERO?: string;
  AFFILIATE_TAG?: string;
  TURNSTILE_SITE_KEY?: string;
  WEB_ANALYTICS_TOKEN?: string;
  // segreti
  APIFY_TOKEN: string;
  OPENROUTER_API_KEY: string;
  TURNSTILE_SECRET: string;
  VISITOR_SALT: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}
