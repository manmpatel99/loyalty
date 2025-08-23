import bcrypt from 'bcryptjs';
import PosDevice from '../models/PosDevice.js'; 
import { generateCode, posKeyId } from '../utils/generateCode.js';


export async function createPosDevice(){
        const viaRole = req.user && req.user.role === 'admin';
        if (!viaHeader && !viaRole)
            return res.status(403).json({ ok: false, error: 'Forbidden' });


        let { name, key } = req.body || {};
        if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ ok: false, error: 'Name is required' });
        }


        if (!key) {
        // Generate a human-ish key for convenience (keep it somewhere safe on the POS)
        key = generateCode('POS').replace(/-/g, ''); // e.g. POSABCDEFGH
        }



    const keyId = posKeyId(key);
    const keyHash = await bcrypt.hash(String(key), 10);


    const device = await PosDevice.create({ name: name.trim(), keyId, keyHash });
    // IMPORTANT: we only show the raw key once on creation if it was generated
    res.status(201).json({
    ok: true,
    device: { 
        id: device._id.toString(), 
        name: device.name,
        active: device.active, 
        createdAt: device.createdAt 
    },
    key
    });

}

    /** List POS devices (admin only) */
    export async function listPosDevices(req, res) {
        const viaHeader = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
        const viaRole = req.user && req.user.role === 'admin';
            if (!viaHeader && !viaRole)
                return res.status(403).json({ ok: false, error: 'Forbidden' });


        const list = await PosDevice.find().sort({ createdAt: -1 }).lean();
            res.json({
            ok: true,
            devices: list.map(d => ({
                id: d._id.toString(),
                name: d.name,
                active: d.active,
                lastUsedAt: d.lastUsedAt,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt
            }))
        });
    }


    /** Delete (deactivate) a POS device (admin only) */
    export async function deletePosDevice(req, res) {
    const viaHeader = req.headers['x-admin-key'] === process.env.ADMIN_KEY;
    const viaRole = req.user && req.user.role === 'admin';
    if (!viaHeader && !viaRole) return res.status(403).json({ ok: false, error: 'Forbidden' });


    const { id } = req.params;
    const device = await PosDevice.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!device) return res.status(404).json({ ok: false, error: 'Device not found' });
        return res.json({ ok: true, device: { id: device._id.toString(), name: device.name, active: device.active } });
    }



 export default createPosDevice;