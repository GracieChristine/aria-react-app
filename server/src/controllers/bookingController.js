import { bookingModel }               from '../models/bookingModel.js'
import { listingModel }               from '../models/listingModel.js'
import { successResponse, errorResponse } from '../utils/response.js'

const formatBooking = (b) => ({
  id:           b.id,
  listingId:    b.listing_id,
  guestId:      b.guest_id,
  checkIn:      b.check_in,
  checkOut:     b.check_out,
  numGuests:    b.num_guests,
  status:       b.status,
  totalPrice:   parseFloat(b.total_price),
  listing: b.listing_title ? {
    title:   b.listing_title,
    city:    b.listing_city,
    country: b.listing_country,
    image:   b.listing_image,
  } : undefined,
  guest: b.guest_first_name ? {
    firstName: b.guest_first_name,
    lastName:  b.guest_last_name,
    avatarUrl: b.guest_avatar_url,
  } : undefined,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
})

export const bookingController = {
  async create(req, res) {
    try {
      const { listingId, checkIn, checkOut, numGuests } = req.body

      const listing = await listingModel.findById(listingId)
      if (!listing) return errorResponse(res, 'Listing not found', 404)
      if (listing.status !== 'active') return errorResponse(res, 'Listing is not available', 400)
      if (numGuests > listing.max_guests) return errorResponse(res, 'Exceeds max guests', 400)

      const available = await bookingModel.checkAvailability(listingId, checkIn, checkOut)
      if (!available) return errorResponse(res, 'Listing not available for these dates', 409)

      const nights     = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      const totalPrice = nights * listing.price_per_night

      const booking = await bookingModel.create({
        listingId,
        guestId: req.user.id,
        checkIn,
        checkOut,
        numGuests,
        totalPrice,
      })

      return successResponse(res, { booking: formatBooking(booking) }, 201)
    } catch (err) {
      console.error('Create booking error:', err)
      return errorResponse(res, 'Failed to create booking', 500)
    }
  },

  async getMyBookings(req, res) {
    try {
      const bookings = await bookingModel.findByGuest(req.user.id)
      return successResponse(res, { bookings: bookings.map(formatBooking) })
    } catch (err) {
      return errorResponse(res, 'Failed to fetch bookings', 500)
    }
  },

  async getListingBookings(req, res) {
    try {
      const bookings = await bookingModel.findByListing(req.params.listingId)
      return successResponse(res, { bookings: bookings.map(formatBooking) })
    } catch (err) {
      return errorResponse(res, 'Failed to fetch bookings', 500)
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body
      const allowed    = ['confirmed', 'cancelled', 'completed']
      if (!allowed.includes(status)) {
        return errorResponse(res, 'Invalid status', 400)
      }

      const booking = await bookingModel.findById(req.params.id)
      if (!booking) return errorResponse(res, 'Booking not found', 404)

      const updated = await bookingModel.updateStatus(req.params.id, status)
      return successResponse(res, { booking: formatBooking(updated) })
    } catch (err) {
      return errorResponse(res, 'Failed to update booking', 500)
    }
  },
}