import pool from '../db/pool.js';

export const locationModel = {
  async findAllUniverses() {
    const { rows } = await pool.query(
      'SELECT id, name, slug FROM universes ORDER BY name ASC'
    );
    return rows;
  },

  async findWorldsByUniverse(universeId) {
    const { rows } = await pool.query(
      `SELECT id, name, description FROM worlds
       WHERE universe_id = $1 ORDER BY name ASC`,
      [universeId]
    );
    return rows;
  },

  async findRegionsByWorld(worldId) {
    const { rows } = await pool.query(
      `SELECT id, name, description FROM regions
       WHERE world_id = $1 ORDER BY name ASC`,
      [worldId]
    );
    return rows;
  },

  async findCitiesByRegion(regionId) {
    const { rows } = await pool.query(
      `SELECT id, name, description FROM cities
       WHERE region_id = $1 ORDER BY name ASC`,
      [regionId]
    );
    return rows;
  },

  async findCityById(cityId) {
    const { rows } = await pool.query(
      `SELECT
         c.id         AS city_id,
         c.name       AS city,
         r.id         AS region_id,
         r.name       AS region,
         w.id         AS world_id,
         w.name       AS world,
         u.id         AS universe_id,
         u.name       AS universe
       FROM cities c
       JOIN regions r   ON r.id = c.region_id
       JOIN worlds w    ON w.id = r.world_id
       JOIN universes u ON u.id = w.universe_id
       WHERE c.id = $1`,
      [cityId]
    );
    return rows[0] || null;
  },

  async findRegionById(regionId) {
    const { rows } = await pool.query(
      'SELECT id FROM regions WHERE id = $1',
      [regionId]
    );
    return rows[0] || null;
  },

  async findWorldById(worldId) {
    const { rows } = await pool.query(
      'SELECT id FROM worlds WHERE id = $1',
      [worldId]
    );
    return rows[0] || null;
  },
};
