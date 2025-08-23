import cron from 'node-cron';
import Code from '../models/code.js';


// Example: log how many codes are expired every day at 03:00
cron.schedule('0 3 * * *', async () => {
try {
const now = new Date();
const count = await Code.countDocuments({ expiresAt: { $ne: null, $lt: now }, used: false });
console.log(`[CRON] ${count} codes currently expired (not used).`);
} catch (e) {
console.error('[CRON] error:', e.message);
}
});