
import 'dotenv/config';
// import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import connectDb from './config/connectDb.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import codeRoutes from './routes/code.routes.js';
import loyaltyRoutes from './routes/loyalty.routes.js';
import posRoutes from './routes/pos.routes.js';
import { notFound, errorHandler } from './middleware/errors.js';
import './cron/jobs.js';
import earnRoutes from './routes/earn.routes.js';
import redeemRoutes from './routes/redeem.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import promosRoutes from './routes/promos.routes.js';
import refundRoutes from './routes/refund.routes.js';

const app = express();


// Core middleware
app.use(express.json());
app.use(
cors({
origin: process.env.CORS_ORIGIN?.split(',') ?? '*'
})
);
app.use(morgan('dev'));


// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/earn', earnRoutes);
app.use('/api/redeem', redeemRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/promos' , promosRoutes);
app.use('/api/refunds', refundRoutes);


// 404 + Error handler
app.use(notFound);
app.use(errorHandler);


// Start
const PORT = process.env.PORT || 4000;
await connectDb(process.env.MONGO_URI);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

