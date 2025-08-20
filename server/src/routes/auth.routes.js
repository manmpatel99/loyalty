import { Router } from "express";
import { body, validationResult } from "express-validator";
import Code from "../models/code.js"; 
import User from "../models/User.js";
import Redemption from "../models/Redemption.js";
import { requireAuth } from "../middleware/auth.js";
import { generateCode } from "../utils/generateCode.js";

const router = Router();

/** Admin-ish: create one code (simple: guarded by a shared header) */
router.post(
  "/create",
  [body("points").isInt({ min: 1 })],
  async (req, res) => {
    // Super simple "admin" check for the test:
    if (req.headers["x-admin-key"] !== "letmein") return res.status(403).json({ error: "Forbidden" });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { points } = req.body;
    const code = await Code.create({ code: generateCode(), points });
    res.json(code);
  }
);

/** User: redeem a code */
router.post(
  "/redeem",
  requireAuth,
  [body("code").isString().trim().isLength({ min: 4 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { code } = req.body;
    const found = await Code.findOne({ code });
    if (!found) return res.status(404).json({ error: "Code not found" });
    if (found.isUsed) return res.status(409).json({ error: "Code already used" });
    if (found.expiresAt && found.expiresAt < new Date()) return res.status(410).json({ error: "Code expired" });

    // mark used + add points atomically
    found.isUsed = true;
    found.usedAt = new Date();
    found.usedBy = req.user.uid;
    await found.save();

    const user = await User.findById(req.user.uid);
    user.points += found.points;
    await user.save();

    await Redemption.create({ userId: user._id, codeId: found._id, points: found.points });

    res.json({ ok: true, added: found.points, totalPoints: user.points });
  }
);

export default router;
