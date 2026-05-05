'use strict';

const rateLimitStore = new Map();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > entry.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanup, 60 * 1000);

function getRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, keyGenerator }) {
  return function rateLimit(req, res, next) {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 1, windowStart: now };
      rateLimitStore.set(key, entry);
      return next();
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter,
      });
    }

    next();
  };
}

function createIpRateLimiter({ windowMs = 15 * 60 * 1000, max = 100 } = {}) {
  return getRateLimiter({
    windowMs,
    max,
    keyGenerator: (req) => req.ip,
  });
}

function createAuthRateLimiter({ windowMs = 10 * 60 * 1000, max = 5 } = {}) {
  return getRateLimiter({
    windowMs,
    max,
    keyGenerator: (req) => {
      const identifier = req.body.email || req.body.phone || req.body.identifier;
      return `auth:${identifier || req.ip}`;
    },
  });
}

function createOtpRateLimiter({ windowMs = 5 * 60 * 1000, max = 3 } = {}) {
  return getRateLimiter({
    windowMs,
    max,
    keyGenerator: (req) => {
      const identifier = req.body.identifier;
      return `otp:${identifier || req.ip}`;
    },
  });
}

module.exports = { createIpRateLimiter, createAuthRateLimiter, createOtpRateLimiter };
