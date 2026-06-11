function notFound(_req, res) {
  res.status(404).json({ ok: false, error: "Route not found." });
}

function errorHandler(error, _req, res, _next) {
  const status = Number(error.status || error.statusCode || 500);
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  const message = safeStatus >= 500 ? "Server error." : error.message;
  if (safeStatus >= 500) {
    console.error(error);
  }
  res.status(safeStatus).json({ ok: false, error: message });
}

export { errorHandler, notFound };
