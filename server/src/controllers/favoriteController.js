import { favoriteModel }              from '../models/favoriteModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const favoriteController = {
  async add(req, res) {
    try {
      const { listingId } = req.params;
      const favorite = await favoriteModel.add(req.user.id, listingId);
      if (!favorite) return successResponse(res, { message: 'Already favorited' });
      return successResponse(res, { favorite }, 201);
    } catch (err) {
      return errorResponse(res, 'Failed to add favorite', 500);
    }
  },

  async remove(req, res) {
    try {
      const { listingId } = req.params;
      const deleted = await favoriteModel.remove(req.user.id, listingId);
      if (!deleted) return errorResponse(res, 'Favorite not found', 404);
      return successResponse(res, { message: 'Removed from favorites' });
    } catch (err) {
      return errorResponse(res, 'Failed to remove favorite', 500);
    }
  },

  async getMyFavorites(req, res) {
    try {
      const favorites = await favoriteModel.findByUser(req.user.id);
      return successResponse(res, { favorites });
    } catch (err) {
      return errorResponse(res, 'Failed to fetch favorites', 500);
    }
  },

  async checkFavorite(req, res) {
    try {
      const { listingId } = req.params;
      const isFavorited = await favoriteModel.isFavorited(req.user.id, listingId);
      return successResponse(res, { isFavorited });
    } catch (err) {
      return errorResponse(res, 'Failed to check favorite', 500);
    }
  },
};