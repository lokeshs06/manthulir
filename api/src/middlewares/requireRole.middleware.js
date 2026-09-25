import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('MISSING_TOKEN', 'Authorization token is required'));
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('FORBIDDEN', 'You do not have permission to perform this action'));
  }
  next();
};
