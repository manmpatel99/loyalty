export function isExpired(expiresAt) {
if (!expiresAt) return false;
return new Date(expiresAt).getTime() < Date.now();
}

