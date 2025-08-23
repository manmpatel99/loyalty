import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sanitizeUser } from '../utils/serverUtils.js';


function signToken(user) {
return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}


export async function register(req, res) {
const { email, password, name, phone } = req.body;


const existing = await User.findOne({ email });
if (existing) return res.status(400).json({ ok: false, error: 'Email already registered' });


const passwordHash = await bcrypt.hash(password, 10);
const user = await User.create({ email, passwordHash, name, phone });


const token = signToken(user);
return res.status(201).json({ ok: true, token, user: sanitizeUser(user) });
}


export async function login(req, res) {
const { email, password } = req.body;


const user = await User.findOne({ email });
if (!user) return res.status(400).json({ ok: false, error: 'Invalid credentials' });


const match = await bcrypt.compare(password, user.passwordHash);
if (!match) return res.status(400).json({ ok: false, error: 'Invalid credentials' });


const token = signToken(user);
return res.json({ ok: true, token, user: sanitizeUser(user) });
}


export async function me(req, res) {
return res.json({ ok: true, user: sanitizeUser(req.user) });
}
