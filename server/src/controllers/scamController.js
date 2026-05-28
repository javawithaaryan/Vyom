import { asyncHandler } from '../middleware/errorHandler.js';
import { analyzeScamMessage, getScamHistory } from '../services/scamService.js';
import { sanitizeText } from '../utils/sanitize.js';

export const analyze = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const content = sanitizeText(req.body.content);

  const data = await analyzeScamMessage({
    userId: req.user._id,
    content,
    io,
  });

  res.status(201).json({ success: true, data });
});

export const history = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const data = await getScamHistory(req.user._id, limit);
  res.json({ success: true, data });
});
