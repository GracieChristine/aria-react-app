import { locationModel }                    from '../models/locationModel.js';
import { successResponse, errorResponse }  from '../utils/response.js';

export const locationController = {
  async getUniverses(req, res) {
    try {
      const universes = await locationModel.findAllUniverses();
      return successResponse(res, { universes });
    } catch (err) {
      console.error('Get universes error:', err);
      return errorResponse(res, 'Failed to fetch universes', 500);
    }
  },

  async getWorlds(req, res) {
    try {
      const worlds = await locationModel.findWorldsByUniverse(req.params.universeId);
      return successResponse(res, { worlds });
    } catch (err) {
      console.error('Get worlds error:', err);
      return errorResponse(res, 'Failed to fetch worlds', 500);
    }
  },

  async getRegions(req, res) {
    try {
      const regions = await locationModel.findRegionsByWorld(req.params.worldId);
      return successResponse(res, { regions });
    } catch (err) {
      console.error('Get regions error:', err);
      return errorResponse(res, 'Failed to fetch regions', 500);
    }
  },

  async getCities(req, res) {
    try {
      const cities = await locationModel.findCitiesByRegion(req.params.regionId);
      return successResponse(res, { cities });
    } catch (err) {
      console.error('Get cities error:', err);
      return errorResponse(res, 'Failed to fetch cities', 500);
    }
  },
};
