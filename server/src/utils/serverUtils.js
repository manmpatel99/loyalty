export const asyncHandler = (fn) => (req, res, next) =>
Promise.resolve(fn(req, res, next)).catch(next);


export const sanitizeUser = (u) => {
if (!u) return null;
const { _id, email, name, phone, role, points, createdAt, updatedAt } = u;
return { id: _id.toString(), email, name, phone, role, points, createdAt, updatedAt };
};


export const ok = (res, data = {}, status = 200) => res.status(status).json({ ok: true, ...data });