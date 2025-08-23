export function notFound(req, res, _next) {
res.status(404).json({ ok: false, error: `Not found: ${req.originalUrl}` });
}


export function errorHandler(err, _req, res, _next) {
console.error(err);
const status = err.status || 500;
res.status(status).json({ ok: false, error: err.message || 'Server error' });
}