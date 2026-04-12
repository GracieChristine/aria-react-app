import { listingModel }                    from '../models/listingModel.js';
import { locationModel }                   from '../models/locationModel.js';
import { successResponse, errorResponse }  from '../utils/response.js';

const formatListing = (l) => ({
  id:            l.id,
  hostId:        l.host_id,
  title:         l.title,
  description:   l.description,
  address:       l.address,
  city:          l.city,
  cityId:        l.city_id,
  region:        l.region,
  regionId:      l.region_id,
  world:         l.world,
  worldId:       l.world_id,
  pricePerNight: parseFloat(l.price_per_night),
  maxGuests:     l.max_guests,
  bedrooms:      l.bedrooms,
  bathrooms:     l.bathrooms,
  propertyType:  l.property_type,
  status:        l.status,
  images:        l.images || [],
  amenities:     l.amenities || [],
  avgRating:     parseFloat(l.avg_rating) || 0,
  reviewCount:   parseInt(l.review_count) || 0,
  host: l.host_first_name ? {
    id:        l.host_id,
    firstName: l.host_first_name,
    lastName:  l.host_last_name,
    avatarUrl: l.host_avatar_url,
    bio:       l.host_bio,
  } : undefined,
  createdAt: l.created_at,
  updatedAt: l.updated_at,
});

export const listingController = {
  // ── GET /api/listings ──
  async getAll(req, res) {
    try {
      const {
        city, world, minPrice, maxPrice,
        guests, propertyType,
        page = 1, limit = 20,
      } = req.query;

      const offset   = (page - 1) * limit;
      const filters  = { city, world, minPrice, maxPrice, guests, propertyType };
      const listings = await listingModel.findAll({ ...filters, limit, offset });
      const total    = await listingModel.countAll(filters);

      return successResponse(res, {
        listings: listings.map(formatListing),
        pagination: {
          total,
          page:       parseInt(page),
          limit:      parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error('Get listings error:', err);
      return errorResponse(res, 'Failed to fetch listings', 500);
    }
  },

  // ── GET /api/listings/:id ──
  async getOne(req, res) {
    try {
      const listing = await listingModel.findById(req.params.id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      return successResponse(res, { listing: formatListing(listing) });
    } catch (err) {
      console.error('Get listing error:', err);
      return errorResponse(res, 'Failed to fetch listing', 500);
    }
  },

  // ── GET /api/listings/host/me ──
  async getHostListings(req, res) {
    try {
      const listings = await listingModel.findByHost(req.user.id);
      return successResponse(res, { listings: listings.map(formatListing) });
    } catch (err) {
      console.error('Get host listings error:', err);
      return errorResponse(res, 'Failed to fetch host listings', 500);
    }
  },

  // ── POST /api/listings ──
  async create(req, res) {
    try {
      const {
        title, description, address,
        cityId, regionId, worldId,
        pricePerNight, maxGuests,
        bedrooms, bathrooms, propertyType,
        status,
      } = req.body;

      // Verify city exists and belongs to the given region and world
      const location = await locationModel.findCityById(cityId);
      if (!location)                        return errorResponse(res, 'City not found', 422);
      if (location.region_id !== regionId)  return errorResponse(res, 'City does not belong to the selected region', 422);
      if (location.world_id !== worldId)    return errorResponse(res, 'Region does not belong to the selected world', 422);

      const listing = await listingModel.create({
        hostId: req.user.id,
        title, description, address,
        city:   location.city,
        region: location.region,
        world:  location.world,
        cityId, regionId, worldId,
        pricePerNight, maxGuests,
        bedrooms, bathrooms, propertyType, status,
      });

      return successResponse(res, { listing: formatListing(listing) }, 201);
    } catch (err) {
      console.error('Create listing error:', err);
      return errorResponse(res, 'Failed to create listing', 500);
    }
  },

  // ── PUT /api/listings/:id ──
  async update(req, res) {
    try {
      const allowed = [
        'title', 'description', 'address',
        'cityId', 'regionId', 'worldId',
        'pricePerNight', 'maxGuests',
        'bedrooms', 'bathrooms', 'propertyType', 'status',
      ];

      const fields = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) fields[key] = req.body[key];
      }

      if (Object.keys(fields).length === 0) {
        return errorResponse(res, 'No valid fields to update', 400);
      }

      // If any location field is being updated, verify the combination is valid
      if (fields.cityId) {
        const location = await locationModel.findCityById(fields.cityId);
        if (!location) return errorResponse(res, 'City not found', 422);
        if (fields.regionId && location.region_id !== fields.regionId) return errorResponse(res, 'City does not belong to the selected region', 422);
        if (fields.worldId  && location.world_id  !== fields.worldId)  return errorResponse(res, 'Region does not belong to the selected world', 422);
        // Sync display names
        fields.city   = location.city;
        fields.region = location.region;
        fields.world  = location.world;
      }

      const listing = await listingModel.findById(req.params.id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      const updated = await listingModel.update(req.params.id, req.user.id, fields);
      return successResponse(res, { listing: formatListing(updated) });
    } catch (err) {
      console.error('Update listing error:', err);
      return errorResponse(res, 'Failed to update listing', 500);
    }
  },

  // ── PATCH /api/listings/:id/status ──
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const { id }     = req.params;
      const user       = req.user;

      const listing = await listingModel.findById(id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);

      if (user.role === 'host' && listing.host_id !== user.id) {
        return errorResponse(res, 'Not authorized', 403);
      }

      const allowedStatuses = {
        host:        ['draft', 'active', 'inactive'],
        admin:       ['inactive'],
        super_admin: ['inactive'],
      };

      const allowed = allowedStatuses[user.role] || [];
      if (!allowed.includes(status)) {
        return errorResponse(res, `Not allowed to set status to ${status}`, 400);
      }

      const updated = await listingModel.update(id, listing.host_id, { status });
      if (!updated) return errorResponse(res, 'Failed to update status', 500);

      return successResponse(res, { listing: formatListing(updated) });
    } catch (err) {
      console.error('Update status error:', err);
      return errorResponse(res, 'Failed to update status', 500);
    }
  },

  // ── DELETE /api/listings/:id ──
  async remove(req, res) {
    try {
      const listing = await listingModel.findById(req.params.id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      await listingModel.delete(req.params.id, req.user.id);
      return successResponse(res, { message: 'Listing deleted successfully' });
    } catch (err) {
      console.error('Delete listing error:', err);
      return errorResponse(res, 'Failed to delete listing', 500);
    }
  },

  // ── GET /api/listings/:id/images ──
  async getImages(req, res) {
    try {
      const listing = await listingModel.findById(req.params.id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);

      const images = await listingModel.getImages(req.params.id);
      return successResponse(res, { images });
    } catch (err) {
      console.error('Get images error:', err);
      return errorResponse(res, 'Failed to fetch images', 500);
    }
  },

  // ── POST /api/listings/:id/images ──
  async addImage(req, res) {
    try {
      const listing = await listingModel.findById(req.params.id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      const { url, displayOrder } = req.body;
      const image = await listingModel.addImage(req.params.id, url, displayOrder);
      return successResponse(res, { image }, 201);
    } catch (err) {
      console.error('Add image error:', err);
      return errorResponse(res, 'Failed to add image', 500);
    }
  },

  // ── DELETE /api/listings/:id/images/:imageId ──
  async removeImage(req, res) {
    try {
      const listing = await listingModel.findById(req.params.id);
      if (!listing) return errorResponse(res, 'Listing not found', 404);
      if (listing.host_id !== req.user.id) return errorResponse(res, 'Not authorized', 403);

      const deleted = await listingModel.deleteImage(req.params.imageId, req.params.id);
      if (!deleted) return errorResponse(res, 'Image not found', 404);
      return successResponse(res, { message: 'Image deleted successfully' });
    } catch (err) {
      console.error('Delete image error:', err);
      return errorResponse(res, 'Failed to delete image', 500);
    }
  },
};
