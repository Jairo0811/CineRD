const crypto = require("crypto");

const requestContext = (req, res, next) => {
  const requestId = req.get("x-request-id") || crypto.randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    console.info(JSON.stringify({
      level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      event: "http.request",
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.usuario?.id || null,
      ip: req.ip,
    }));
  });

  next();
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(JSON.stringify({
    level: "error",
    event: "http.unhandled_error",
    requestId: req.requestId,
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  }));
  return res.status(500).json({ mensaje: "Error interno del servidor", requestId: req.requestId });
};

module.exports = { requestContext, errorHandler };
