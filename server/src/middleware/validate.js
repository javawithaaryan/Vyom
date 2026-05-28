import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new AppError(first.msg, 400);
  }
  next();
}
