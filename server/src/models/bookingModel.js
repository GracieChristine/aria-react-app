import pool from '../db/pool.js';

export const bookingModel = {
  async create({ listingId, guestId, checkIn, checkOut, numGuests, totalPrice }) {
    const { rows } = await pool.query(
      `INSERT INTO bookings
        (listing_id, guest_id, check_in, check_out, num_guests, total_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [listingId, guestId, checkIn, checkOut, numGuests, totalPrice]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT b.*,
        l.title         AS listing_title,
        l.address       AS listing_address,
        l.city          AS listing_city,
        l.country       AS listing_country,
        l.price_per_night,
        u.first_name    AS guest_first_name,
        u.last_name     AS guest_last_name,
        u.avatar_url    AS guest_avatar_url,
        (SELECT url FROM listing_images
         WHERE listing_id = l.id
         ORDER BY display_order LIMIT 1) AS listing_image
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u    ON u.id = b.guest_id
       WHERE b.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByGuest(guestId) {
    const { rows } = await pool.query(
      `SELECT b.*,
        l.title      AS listing_title,
        l.city       AS listing_city,
        l.country    AS listing_country,
        (SELECT url FROM listing_images
         WHERE listing_id = l.id
         ORDER BY display_order LIMIT 1) AS listing_image
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.guest_id = $1
       ORDER BY b.created_at DESC`,
      [guestId]
    );
    return rows;
  },

  async findByListing(listingId) {
    const { rows } = await pool.query(
      `SELECT b.*,
        u.first_name AS guest_first_name,
        u.last_name  AS guest_last_name,
        u.avatar_url AS guest_avatar_url
       FROM bookings b
       JOIN users u ON u.id = b.guest_id
       WHERE b.listing_id = $1
       ORDER BY b.created_at DESC`,
      [listingId]
    );
    return rows;
  },

  async update(id, { checkIn, checkOut, numGuests, totalPrice }) {
    const { rows } = await pool.query(
      `UPDATE bookings
      SET check_in = $1, check_out = $2, num_guests = $3,
          total_price = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *`,
      [checkIn, checkOut, numGuests, totalPrice, id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  },

  async checkAvailability(listingId, checkIn, checkOut, excludeBookingId = null) {
    const { rows } = await pool.query(
      `SELECT id FROM bookings
      WHERE listing_id = $1
        AND status IN ('pending', 'confirmed')
        AND NOT (check_out <= $2 OR check_in >= $3)
        AND ($4::uuid IS NULL OR id != $4)`,
      [listingId, checkIn, checkOut, excludeBookingId]
    );
    return rows.length === 0;
  },
};