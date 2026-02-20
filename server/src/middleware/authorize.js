import { errorResponse } from '../utils/response.js';

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Not authenticated', 401);
  }

  if (!roles.includes(req.user.role)) {
    return errorResponse(res, 'Not authorized', 403);
  }

  next();
};