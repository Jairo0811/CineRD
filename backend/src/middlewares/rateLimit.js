const CLEANUP_INTERVAL_MS = 60 * 1000;

function createRateLimit({ windowMs = 15 * 60 * 1000, max = 20, keyGenerator } = {}) {
  const buckets = new Map();
  let lastCleanup = Date.now();

  const purge = (now) => {
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    lastCleanup = now;
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  };

  const middleware = (req, res, next) => {
    const now = Date.now();
    purge(now);
    const generated = keyGenerator ? keyGenerator(req) : null;
    const key = generated || req.ip || req.socket?.remoteAddress || "unknown";
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ mensaje: "Demasiados intentos. Intenta nuevamente más tarde." });
    }

    return next();
  };

  middleware.size = () => buckets.size;
  middleware.reset = () => buckets.clear();
  return middleware;
}

module.exports = { createRateLimit };
