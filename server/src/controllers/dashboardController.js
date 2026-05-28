import { asyncHandler } from '../middleware/errorHandler.js';
import { getDashboardData } from '../services/dashboardService.js';

export const stats = asyncHandler(async (req, res) => {
  const data = await getDashboardData(req.user._id);
  res.json({ success: true, data });
});

export const riskEvents = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const RiskEvent = (await import('../models/RiskEvent.js')).default;
  const data = await RiskEvent.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json({ success: true, data });
});

export const alerts = asyncHandler(async (req, res) => {
  const { getRecentAlerts } = await import('../services/alertService.js');
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const data = await getRecentAlerts(req.user._id, limit);
  res.json({ success: true, data });
});
