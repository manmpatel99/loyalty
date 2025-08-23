import { body, query, validationResult } from 'express-validator';


export const registerValidators = [
body('email').isEmail().withMessage('Valid email required'),
body('password').isLength({ min: 6 }).withMessage('Password >= 6 chars'),
body('name').optional().isString().trim().isLength({ min: 1 }).withMessage('Name invalid'),
body('phone').optional().isString().trim()
];


export const loginValidators = [
body('email').isEmail(),
body('password').isString().isLength({ min: 1 })
];


export const createCodeValidators = [
body('points').isInt({ min: 1 }),
body('expiresAt').optional().isISO8601().toDate(),
body('prefix').optional().isString().trim().isLength({ max: 8 })
];


export const redeemCodeValidators = [
body('code').isString().trim().isLength({ min: 3 })
];


export const validateCodeValidators = [
query('code').isString().trim().isLength({ min: 3 })
];


export function handleValidation(req, res, next) {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });
next();
}
