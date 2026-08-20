import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Too many payment attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Guards the public order-tracking lookup. The phone number is the only
 * secret protecting an order, so wrong guesses are capped tightly.
 *
 * Only failed lookups count (`skipSuccessfulRequests`): brute-forcing an
 * order/phone pair produces misses, whereas a customer watching their own
 * order — the page re-checks for status changes while it is open — only ever
 * produces hits and is never throttled.
 */
export const orderTrackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many tracking attempts. Please try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
