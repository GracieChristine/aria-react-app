import { seedListings, unseedListings } from './seedService.js';
import { errorResponse, successResponse } from '../utils/response.js';

export const devController = {
  async seedListings(req, res) {
    try {
      const { id, first_name, last_name } = req.user;
      const result = await seedListings(id, first_name, last_name);
      if (!result.ok) return errorResponse(res, result.message, 400);
      return successResponse(res, { message: result.message });
    } catch (err) {
      console.error('seedListings error:', err);
      return errorResponse(res, 'Failed to seed listings.', 500);
    }
  },

  async unseedListings(req, res) {
    try {
      const { id } = req.user;
      const result = await unseedListings(id);
      if (!result.ok) return errorResponse(res, result.message, 400);
      return successResponse(res, { message: result.message });
    } catch (err) {
      console.error('unseedListings error:', err);
      return errorResponse(res, 'Failed to unseed listings.', 500);
    }
  },
};
