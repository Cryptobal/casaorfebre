import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** POST /api/auth/* — 5 requests per minute */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "rl:auth",
});

/** POST /api/upload/* — 20 uploads per minute per user */
export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "rl:upload",
});

/** Checkout actions — 3 per minute */
export const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  prefix: "rl:checkout",
});

/** POST /api/webhooks/* — 100 per minute (don't block MercadoPago) */
export const webhookLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "rl:webhook",
});

/** Fotos en formulario público de postulación (sin sesión) — por IP */
export const applicationPhotoLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "rl:app-photo",
});

/** AI blog generation — 5 per hour per user */
export const aiBlogLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:ai-blog",
});

/** AI product listing generation — 10 per hour per user */
export const aiProductLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "rl:ai-product",
});

/** AI answer suggestion — 30 per day per user */
export const aiSuggestLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 d"),
  prefix: "rl:ai-suggest",
});

/** AI collection curation — 5 per hour per admin */
export const aiCollectionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:ai-collection",
});
