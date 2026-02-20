import pool from '../db/pool.js';

export const messageModel = {
  async findOrCreateConversation(listingId, guestId, hostId) {
    const { rows: existing } = await pool.query(
      `SELECT * FROM conversations
       WHERE listing_id = $1 AND guest_id = $2 AND host_id = $3`,
      [listingId, guestId, hostId]
    );
    if (existing[0]) return existing[0];

    const { rows } = await pool.query(
      `INSERT INTO conversations (listing_id, guest_id, host_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [listingId, guestId, hostId]
    );
    return rows[0];
  },

  async findConversationsByUser(userId) {
    const { rows } = await pool.query(
      `SELECT c.*,
        l.title      AS listing_title,
        l.city       AS listing_city,
        g.first_name AS guest_first_name,
        g.last_name  AS guest_last_name,
        g.avatar_url AS guest_avatar_url,
        h.first_name AS host_first_name,
        h.last_name  AS host_last_name,
        h.avatar_url AS host_avatar_url,
        (SELECT body FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages
         WHERE conversation_id = c.id
           AND sender_id != $1
           AND is_read = false) AS unread_count
       FROM conversations c
       JOIN listings l ON l.id = c.listing_id
       JOIN users g    ON g.id = c.guest_id
       JOIN users h    ON h.id = c.host_id
       WHERE c.guest_id = $1 OR c.host_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [userId]
    );
    return rows;
  },

  async findMessages(conversationId) {
    const { rows } = await pool.query(
      `SELECT m.*,
        u.first_name AS sender_first_name,
        u.last_name  AS sender_last_name,
        u.avatar_url AS sender_avatar_url
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );
    return rows;
  },

  async sendMessage(conversationId, senderId, body) {
    const { rows } = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, senderId, body]
    );
    return rows[0];
  },

  async markAsRead(conversationId, userId) {
    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE conversation_id = $1
         AND sender_id != $2
         AND is_read = false`,
      [conversationId, userId]
    );
  },
};