import { asyncHandler } from '../middleware/errorHandler.js';
import { analyzeTransaction, getTransactionHistory } from '../services/fraudService.js';

export const analyze = asyncHandler(async (req, res) => {
  const { amount, location, device, merchantCategory } = req.body;
  const io = req.app.get('io');

  const data = await analyzeTransaction({
    userId: req.user._id,
    amount,
    location,
    device,
    merchantCategory,
    io,
  });

  res.status(201).json({ success: true, data });
});

export const history = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const data = await getTransactionHistory(req.user._id, limit);
  res.json({ success: true, data });
});
