function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function sendNotFound(res, error) {
  return res.status(404).json({ ok: false, error });
}

export { asyncRoute, sendNotFound };
