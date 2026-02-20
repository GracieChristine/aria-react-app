import { listingModel }               from '../models/listingModel.js'
import { successResponse, errorResponse } from '../utils/response.js'

const formatListing = (l) => ({
  id:            l.id,
  hostId:        l.host_id,
  title:         l.title,
  description:   l.description,
  address:       l.address,
  city:          l.city,
  country:       l.country,
  lat:           l.lat,
  lng:           l.lng,
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
})

export const listingController = {
  // ── GET /api/listings ──
  async getAll(req, res) {
    try {
      const {
        city, country, minPrice, maxPrice,
        guests, propertyType,
        page = 1, limit = 20,
      } = req.query

      const offset   = (page - 1) * limit
      const filters  = { city, country, minPrice, maxPrice, guests, propertyType }
      const listings = await listingModel.findAll({ ...filters, limit, offset })
      const total    = await listingModel.countAll(filters)

      return successResponse(res, {
        listings: listings.map(formatListing),
        pagination: {
          total,
          page:       parseInt(page),
          limit:      parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (err) {
      console.error('Get listings error:', err)
      return errorResponse(res, 'Failed to fetch listings', 500)
    }
  },

  // ── GET /api/listings/:id ──
  async getOne(req, res) {
    try {
      const listing = await listingModel.findById(req.params.id)
      if (!listing) return errorResponse(res, 'Listing not found', 404)
      return successResponse(res, { listing: formatListing(listing) })
    } catch (err) {
      console.error('Get listing error:', err)
      return errorResponse(res, 'Failed to fetch listing', 500)
    }
  },

  // ── GET /api/listings/host/me ──
  async getHostListings(req, res) {
    try {
      const listings = await listingModel.findByHost(req.user.id)
      return successResponse(res, { listings: listings.map(formatListing) })
    } catch (err) {
      console.error('Get host listings error:', err)
      return errorResponse(res, 'Failed to fetch host listings', 500)
    }
  },

  // ── POST /api/listings ──
  async create(req, res) {
    try {
      const {
        title, description, address, city, country,
        lat, lng, pricePerNight, maxGuests,
        bedrooms, bathrooms, propertyType,
      } = req.body

      const listing = await listingModel.create({
        hostId: req.user.id,
        title, description, address, city, country,
        lat, lng, pricePerNight, maxGuests,
        bedrooms, bathrooms, propertyType,
      })

      return successResponse(res, { listing: formatListing(listing) }, 201)
    } catch (err) {
      console.error('Create listing error:', err)
      return errorResponse(res, 'Failed to create listing', 500)
    }
  },

  // ── PUT /api/listings/:id ──
  async update(req, res) {
  try {
    const allowed = [
      'title', 'description', 'address', 'city', 'country',
      'lat', 'lng', 'pricePerNight', 'maxGuests',
      'bedrooms', 'bathrooms', 'propertyType', 'status',
    ];

    const fields = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) fields[key] = req.body[key];
    }

    if (Object.keys(fields).length === 0) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    const listing = await listingModel.update(req.params.id, req.user.id, fields);
    if (!listing) return errorResponse(res, 'Listing not found or unauthorized', 404);

    return successResponse(res, { listing: formatListing(listing) });
  } catch (err) {
    console.error('Update listing error:', err);
    return errorResponse(res, 'Failed to update listing', 500);
  }
},

  // ── PATCH /api/listings/:id/status ──
  async updateStatus(req, res) {
  try {
    const { status } = req.body
    const { id }     = req.params
    const user       = req.user

    const listing = await listingModel.findById(id)
    if (!listing) return errorResponse(res, 'Listing not found', 404)

    if (user.role === 'host' && listing.host_id !== user.id) {
      return errorResponse(res, 'Not authorized', 403)
    }

    const allowedStatuses = {
      host:        ['active', 'inactive'],
      admin:       ['inactive'],
      super_admin: ['inactive'],
    }

    const allowed = allowedStatuses[user.role] || []
    if (!allowed.includes(status)) {
      return errorResponse(res, `Not allowed to set status to ${status}`, 403)
    }

    const updated = await listingModel.update(id, listing.host_id, { status })
    if (!updated) return errorResponse(res, 'Failed to update status', 500)

    return successResponse(res, { listing: formatListing(updated) })
  } catch (err) {
    console.error('Update status error:', err)
    return errorResponse(res, 'Failed to update status', 500)
  }
},

  // ── DELETE /api/listings/:id ──
  async remove(req, res) {
    try {
      const deleted = await listingModel.delete(req.params.id, req.user.id)
      if (!deleted) return errorResponse(res, 'Listing not found or unauthorized', 404)
      return successResponse(res, { message: 'Listing deleted successfully' })
    } catch (err) {
      console.error('Delete listing error:', err)
      return errorResponse(res, 'Failed to delete listing', 500)
    }
  },

  // ── POST /api/listings/:id/images ──
  async addImage(req, res) {
    try {
      const { url, displayOrder } = req.body
      const image = await listingModel.addImage(req.params.id, url, displayOrder)
      return successResponse(res, { image }, 201)
    } catch (err) {
      console.error('Add image error:', err)
      return errorResponse(res, 'Failed to add image', 500)
    }
  },

  // ── DELETE /api/listings/:id/images/:imageId ──
  async removeImage(req, res) {
    try {
      const deleted = await listingModel.deleteImage(
        req.params.imageId,
        req.params.id
      )
      if (!deleted) return errorResponse(res, 'Image not found', 404)
      return successResponse(res, { message: 'Image deleted successfully' })
    } catch (err) {
      console.error('Delete image error:', err)
      return errorResponse(res, 'Failed to delete image', 500)
    }
  },
}