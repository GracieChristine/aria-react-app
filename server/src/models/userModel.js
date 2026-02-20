import pool from '../db/pool.js';

export const userModel = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, email, first_name, last_name, avatar_url, 
              role, bio, phone, is_verified, created_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ email, passwordHash, firstName, lastName, role = 'guest' }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, passwordHash, firstName, lastName, role]
    );
    return rows[0];
  },

  async update(id, fields) {
    const keys   = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const { rows } = await pool.query(
      `UPDATE users SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING id, email, first_name, last_name, avatar_url,
                 role, bio, phone, is_verified, created_at`,
      [...values, id]
    );
    return rows[0] || null;
  },
};