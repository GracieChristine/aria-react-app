import pool from '../db/pool.js'

export const listingModel = {
  async findAll({ city, country, minPrice, maxPrice, guests, propertyType, status = 'active', limit = 20, offset = 0 }) {
    const conditions = ['l.status = $1']
    const values     = [status]
    let   paramCount = 2

    if (city) {
      conditions.push(`l.city ILIKE $${paramCount++}`)
      values.push(`%${city}%`)
    }
    if (country) {
      conditions.push(`l.country ILIKE $${paramCount++}`)
      values.push(`%${country}%`)
    }
    if (minPrice) {
      conditions.push(`l.price_per_night >= $${paramCount++}`)
      values.push(minPrice)
    }
    if (maxPrice) {
      conditions.push(`l.price_per_night <= $${paramCount++}`)
      values.push(maxPrice)
    }
    if (guests) {
      conditions.push(`l.max_guests >= $${paramCount++}`)
      values.push(guests)
    }
    if (propertyType) {
      conditions.push(`l.property_type = $${paramCount++}`)
      values.push(propertyType)
    }

    const where = conditions.join(' AND ')

    const { rows } = await pool.query(
      `SELECT 
        l.*,
        u.first_name AS host_first_name,
        u.last_name  AS host_last_name,
        u.avatar_url AS host_avatar_url,
        COALESCE(
          json_agg(DISTINCT li.url) FILTER (WHERE li.url IS NOT NULL), '[]'
        ) AS images,
        COALESCE(AVG(r.rating), 0)  AS avg_rating,
        COUNT(DISTINCT r.id)        AS review_count
       FROM listings l
       JOIN users u          ON u.id = l.host_id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       LEFT JOIN reviews r        ON r.listing_id  = l.id
       WHERE ${where}
       GROUP BY l.id, u.first_name, u.last_name, u.avatar_url
       ORDER BY l.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    )
    return rows
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT
        l.*,
        u.id         AS host_id,
        u.first_name AS host_first_name,
        u.last_name  AS host_last_name,
        u.avatar_url AS host_avatar_url,
        u.bio        AS host_bio,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('url', li.url, 'order', li.display_order))
          FILTER (WHERE li.url IS NOT NULL), '[]'
        ) AS images,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name, 'icon', a.icon))
          FILTER (WHERE a.id IS NOT NULL), '[]'
        ) AS amenities,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id)       AS review_count
       FROM listings l
       JOIN users u               ON u.id = l.host_id
       LEFT JOIN listing_images li     ON li.listing_id = l.id
       LEFT JOIN listing_amenities la  ON la.listing_id = l.id
       LEFT JOIN amenities a           ON a.id = la.amenity_id
       LEFT JOIN reviews r             ON r.listing_id  = l.id
       WHERE l.id = $1
       GROUP BY l.id, u.id, u.first_name, u.last_name, u.avatar_url, u.bio`,
      [id]
    )
    return rows[0] || null
  },

  async findByHost(hostId) {
    const { rows } = await pool.query(
      `SELECT
        l.*,
        COALESCE(
          json_agg(DISTINCT li.url) FILTER (WHERE li.url IS NOT NULL), '[]'
        ) AS images,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id)       AS review_count
       FROM listings l
       LEFT JOIN listing_images li ON li.listing_id = l.id
       LEFT JOIN reviews r         ON r.listing_id  = l.id
       WHERE l.host_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [hostId]
    )
    return rows
  },

  async create({ hostId, title, description, address, city, country, lat, lng, pricePerNight, maxGuests, bedrooms, bathrooms, propertyType }) {
    const { rows } = await pool.query(
      `INSERT INTO listings
        (host_id, title, description, address, city, country, lat, lng,
         price_per_night, max_guests, bedrooms, bathrooms, property_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [hostId, title, description, address, city, country, lat, lng,
       pricePerNight, maxGuests, bedrooms, bathrooms, propertyType]
    )
    return rows[0]
  },

  async update(id, hostId, fields) {
    const keys   = Object.keys(fields)
    const values = Object.values(fields)
    const setClause = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ')

    const { rows } = await pool.query(
      `UPDATE listings SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1} AND host_id = $${keys.length + 2}
       RETURNING *`,
      [...values, id, hostId]
    )
    return rows[0] || null
  },

  async delete(id, hostId) {
    const { rows } = await pool.query(
      `DELETE FROM listings WHERE id = $1 AND host_id = $2 RETURNING id`,
      [id, hostId]
    )
    return rows[0] || null
  },

  async addImage(listingId, url, displayOrder = 0) {
    const { rows } = await pool.query(
      `INSERT INTO listing_images (listing_id, url, display_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [listingId, url, displayOrder]
    )
    return rows[0]
  },

  async deleteImage(imageId, listingId) {
    const { rows } = await pool.query(
      `DELETE FROM listing_images WHERE id = $1 AND listing_id = $2 RETURNING id`,
      [imageId, listingId]
    )
    return rows[0] || null
  },

  async countAll(filters) {
    const { city, country, minPrice, maxPrice, guests, propertyType, status = 'active' } = filters
    const conditions = ['status = $1']
    const values     = [status]
    let   paramCount = 2

    if (city)         { conditions.push(`city ILIKE $${paramCount++}`);           values.push(`%${city}%`) }
    if (country)      { conditions.push(`country ILIKE $${paramCount++}`);        values.push(`%${country}%`) }
    if (minPrice)     { conditions.push(`price_per_night >= $${paramCount++}`);   values.push(minPrice) }
    if (maxPrice)     { conditions.push(`price_per_night <= $${paramCount++}`);   values.push(maxPrice) }
    if (guests)       { conditions.push(`max_guests >= $${paramCount++}`);        values.push(guests) }
    if (propertyType) { conditions.push(`property_type = $${paramCount++}`);      values.push(propertyType) }

    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE ${conditions.join(' AND ')}`,
      values
    )
    return parseInt(rows[0].count)
  },
}