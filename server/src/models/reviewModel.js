import pool from '../db/pool.js';

export const reviewModel = {
  async create({ bookingId, listingId, reviewerId, revieweeId, rating, comment }) {
    const { rows } = await pool.query(
      `INSERT INTO reviews
        (booking_id, listing_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [bookingId, listingId, reviewerId, revieweeId, rating, comment]
    );
    return rows[0];
  },

  async findByListing(listingId) {
    const { rows } = await pool.query(
      `SELECT r.*,
        u.first_name AS reviewer_first_name,
        u.last_name  AS reviewer_last_name,
        u.avatar_url AS reviewer_avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC`,
      [listingId]
    );
    return rows;
  },

  async findByUser(userId) {
    const { rows } = await pool.query(
      `SELECT r.*,
        l.title AS listing_title
       FROM reviews r
       JOIN listings l ON l.id = r.listing_id
       WHERE r.reviewer_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async existsForBooking(bookingId, reviewerId) {
    const { rows } = await pool.query(
      `SELECT id FROM reviews
       WHERE booking_id = $1 AND reviewer_id = $2`,
      [bookingId, reviewerId]
    );
    return rows.length > 0;
  },
};