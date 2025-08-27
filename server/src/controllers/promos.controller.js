import Promotion from '../models/Promotion.js';

export async function createPromo(req,res){
  const merchantId = req.user._id; // assume merchant login
  const p = await Promotion.create({ merchant: merchantId, ...req.body });
  res.json(p);
}
export async function listPromos(req,res){
  const merchantId = req.user._id;
  const ps = await Promotion.find({ merchant: merchantId }).sort({ startsAt:-1 });
  res.json(ps);
}
export async function updatePromo(req,res){
  const merchantId = req.user._id;
  const p = await Promotion.findOneAndUpdate(
    { _id: req.params.id, merchant: merchantId },
    req.body, { new: true }
  );
  res.json(p);
}
export async function deletePromo(req,res){
  const merchantId = req.user._id;
  await Promotion.deleteOne({ _id: req.params.id, merchant: merchantId });
  res.json({ ok: true });
}
