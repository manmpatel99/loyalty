// Human-friendly code (no 0/O or 1/I)
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';


function randomChunk(len = 4) {
let s = '';
for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
return s;
}


export function generateCode(prefix = 'RC') {
return `${prefix}-${randomChunk()}-${randomChunk()}`;
}

export function posKeyId(key) {
  return createHash('sha256')
    .update(String(key))
    .digest('hex')
    .slice(0, 12)
    .toUpperCase(); // e.g. "A1B2C3D4E5F6"
}