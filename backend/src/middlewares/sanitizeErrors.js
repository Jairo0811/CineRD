function sanitizeErrorResponses(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 500 && body && typeof body === "object" && !Array.isArray(body)) {
      const sanitized = { ...body };
      delete sanitized.error;
      if (!sanitized.requestId && req.requestId) sanitized.requestId = req.requestId;
      return originalJson(sanitized);
    }

    return originalJson(body);
  };

  next();
}

module.exports = { sanitizeErrorResponses };
