import pool from '../db/pool.js';

export const favoriteModel = {
  async add(userId, listingId) {
    const { rows } = await pool.query(
      `INSERT INTO favorites (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING
       RETURNING *`,
      [userId, listingId]
    );
    return rows[0] || null;
  },

  async remove(userId, listingId) {
    const { rows } = await pool.query(
      `DELETE FROM favorites
       WHERE user_id = $1 AND listing_id = $2
       RETURNING id`,
      [userId, listingId]
    );
    return rows[0] || null;
  },

  async findByUser(userId) {
    const { rows } = await pool.query(
      `SELECT f.*, l.title, l.city, l.country,
        l.price_per_night,
        (SELECT url FROM listing_images
         WHERE listing_id = l.id
         ORDER BY display_order LIMIT 1) AS listing_image,
        COALESCE(AVG(r.rating), 0)  AS avg_rating
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       LEFT JOIN reviews r ON r.listing_id = l.id
       WHERE f.user_id = $1
       GROUP BY f.id, l.id, l.title, l.city, l.country, l.price_per_night
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async isFavorited(userId, listingId) {
    const { rows } = await pool.query(
      `SELECT id FROM favorites
       WHERE user_id = $1 AND listing_id = $2`,
      [userId, listingId]
    );
    return rows.length > 0;
  },
};