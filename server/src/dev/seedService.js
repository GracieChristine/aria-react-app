import pool from '../db/pool.js';
import { seedLocations } from './locationService.js';

const TEMPLATES = [
  { title: 'Frostfall Cottage',       address: '1 Glacier Way',          propertyType: 'cottage',       pricePerNight: 120, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'active'   },
  { title: 'The Crystal Manor',       address: '2 Aurora Heights',       propertyType: 'manor',         pricePerNight: 280, bedrooms: 5, bathrooms: 3, maxGuests: 10, status: 'active'   },
  { title: 'Tide Watch Cove',         address: '3 Coral Drift Lane',     propertyType: 'seaside_cove',  pricePerNight: 175, bedrooms: 3, bathrooms: 2, maxGuests: 6,  status: 'active'   },
  { title: 'The Sunken Suite',        address: '4 Abyssal Court',        propertyType: 'cavern',        pricePerNight: 95,  bedrooms: 1, bathrooms: 1, maxGuests: 2,  status: 'inactive' },
  { title: 'Savanna Treehouse',       address: '5 Baobab Ridge',         propertyType: 'treehouse',     pricePerNight: 210, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'active'   },
  { title: 'Lost Boys Lodge',         address: '6 Pixie Dust Path',      propertyType: 'hidden_burrow', pricePerNight: 140, bedrooms: 3, bathrooms: 2, maxGuests: 8,  status: 'active'   },
  { title: 'Enchanted Rose Castle',   address: '7 Thornwood Circle',     propertyType: 'castle',        pricePerNight: 450, bedrooms: 8, bathrooms: 5, maxGuests: 16, status: 'active'   },
  { title: 'The Gilded Tower',        address: '8 Lantern Rise',         propertyType: 'tower',         pricePerNight: 195, bedrooms: 4, bathrooms: 2, maxGuests: 7,  status: 'active'   },
  { title: 'Swamp Hollow Cottage',    address: '9 Bog Blossom Lane',     propertyType: 'cottage',       pricePerNight: 85,  bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'inactive' },
  { title: 'Fairytale Manor',         address: '10 Storybook Close',     propertyType: 'manor',         pricePerNight: 320, bedrooms: 6, bathrooms: 4, maxGuests: 12, status: 'active'   },
  { title: 'Mirror Lake Retreat',     address: '11 Obsidian Drive',      propertyType: 'cavern',        pricePerNight: 110, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'active'   },
  { title: "Dwarfs' Hollow",          address: '12 Gemstone Pass',       propertyType: 'hidden_burrow', pricePerNight: 130, bedrooms: 3, bathrooms: 2, maxGuests: 7,  status: 'active'   },
  { title: 'Briar Rose Cottage',      address: '13 Slumbering Vine Way', propertyType: 'cottage',       pricePerNight: 155, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'inactive' },
  { title: 'The Moors Watchtower',    address: '14 Mooredge Bluff',      propertyType: 'tower',         pricePerNight: 230, bedrooms: 3, bathrooms: 2, maxGuests: 6,  status: 'active'   },
  { title: 'Imperial Garden Suite',   address: '15 Dynasty Terrace',     propertyType: 'academy_suite', pricePerNight: 260, bedrooms: 4, bathrooms: 3, maxGuests: 8,  status: 'active'   },
  { title: 'Great Wall Retreat',      address: '16 Northern Pass Road',  propertyType: 'castle',        pricePerNight: 380, bedrooms: 7, bathrooms: 4, maxGuests: 14, status: 'inactive' },
  { title: 'Hogwarts Lakeside Cabin', address: '17 Black Lake Shore',    propertyType: 'cottage',       pricePerNight: 200, bedrooms: 3, bathrooms: 2, maxGuests: 6,  status: 'active'   },
  { title: 'Beauxbatons Palace Wing', address: '18 Garden Terrace',      propertyType: 'academy_suite', pricePerNight: 340, bedrooms: 5, bathrooms: 3, maxGuests: 10, status: 'active'   },
  { title: 'The Dark Tower Study',    address: '19 Durmstrang Keep',     propertyType: 'tower',         pricePerNight: 170, bedrooms: 2, bathrooms: 1, maxGuests: 3,  status: 'active'   },
  { title: 'Diagon Alley Flat',       address: '20 Cobblestone Row',     propertyType: 'hidden_burrow', pricePerNight: 145, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'inactive' },
  { title: 'Ministry Quarter Studio', address: '21 Underhill Lane',      propertyType: 'academy_suite', pricePerNight: 115, bedrooms: 1, bathrooms: 1, maxGuests: 2,  status: 'active'   },
  { title: 'Baker Street Rooms',      address: '22 Fog & Gaslight Mews', propertyType: 'manor',         pricePerNight: 190, bedrooms: 3, bathrooms: 2, maxGuests: 5,  status: 'active'   },
  { title: 'Hollow Needle Hideout',   address: '23 Cliff Edge Path',     propertyType: 'hidden_burrow', pricePerNight: 220, bedrooms: 3, bathrooms: 2, maxGuests: 6,  status: 'inactive' },
  { title: 'Bridgerton Townhouse',    address: '24 Mayfair Crescent',    propertyType: 'manor',         pricePerNight: 410, bedrooms: 6, bathrooms: 4, maxGuests: 12, status: 'active'   },
  { title: 'Pemberley East Wing',     address: '25 Derbyshire Heights',  propertyType: 'castle',        pricePerNight: 500, bedrooms: 9, bathrooms: 6, maxGuests: 18, status: 'active'   },
  { title: 'Hartfield Cottage',       address: '26 Surrey Green Lane',   propertyType: 'cottage',       pricePerNight: 135, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'active'   },
  { title: 'Barton Cottage',          address: '27 Devonshire Dale',     propertyType: 'cottage',       pricePerNight: 100, bedrooms: 2, bathrooms: 1, maxGuests: 4,  status: 'inactive' },
  { title: 'Royal Crescent Suite',    address: '28 Georgian Parade',     propertyType: 'academy_suite', pricePerNight: 295, bedrooms: 4, bathrooms: 3, maxGuests: 8,  status: 'active'   },
  { title: 'Floating Isle Retreat',   address: '29 Skyward Drift',       propertyType: 'floating_isle', pricePerNight: 350, bedrooms: 4, bathrooms: 2, maxGuests: 8,  status: 'active'   },
  { title: 'The Forbidden Burrow',    address: '30 Ottery St Passage',   propertyType: 'hidden_burrow', pricePerNight: 160, bedrooms: 3, bathrooms: 2, maxGuests: 6,  status: 'active'   },
];

const DESCRIPTIONS = [
  'A charming retreat tucked away from the bustle, perfect for a quiet escape.',
  'Grand in scale and rich in history — an unforgettable stay for those who appreciate the finer things.',
  "Perched at the water's edge with sweeping views and the sound of waves to lull you to sleep.",
  'Deep, dark, and delightfully mysterious — not for the faint of heart.',
  'High above the canopy, this treehouse offers views that stretch to the horizon.',
  'Hidden from prying eyes, this cosy burrow is your secret home away from home.',
  'A magnificent fortress dripping in history, enchantment, and old-world grandeur.',
  'Soaring above the surrounding lands, the tower commands stunning panoramic views.',
  'Rustic and welcoming, nestled in a tranquil corner of the swamp far from everyday life.',
  'Straight out of a storybook — lavish rooms, manicured grounds, and fairy-tale charm.',
  'Carved into the rock face with a secret entrance and an atmosphere unlike anywhere else.',
  'Snug and storied, this burrow has hosted more than a few legendary adventures.',
  'Wisteria-draped walls and a fragrant garden make this cottage a dreamy getaway.',
  'Standing sentinel over the wild moorlands — atmospheric, dramatic, and utterly unique.',
  'Elegant academy quarters with high ceilings, arched windows, and a scholarly atmosphere.',
  'A fortress retreat along the ancient wall — steeped in military history and mountain air.',
  'Lakeside peace and castle views combine for an unrivalled wizarding experience.',
  'Palace-grade luxury with formal gardens just outside your door.',
  'A secretive stone room at the top of the old keep — mysterious and utterly private.',
  'A cosy flat above the cobblestones in the most magical shopping street in existence.',
  'A sleek underground studio steps from the most powerful ministry in the wizarding world.',
  'Period townhouse rooms in the most famous street in detective fiction.',
  'A clifftop hideout with secret passages and sweeping sea views.',
  'A season-ready townhouse in the heart of the ton — impeccably furnished and perfectly located.',
  'The east wing of a legendary estate — aristocratic comfort at its very finest.',
  'A welcoming village cottage surrounded by Surrey countryside and good neighbours.',
  'The cottage that sheltered broken hearts — simple, comfortable, and quietly romantic.',
  'Regency splendour in the most coveted address in Bath.',
  'An isle suspended between sky and sea — a once-in-a-lifetime stay.',
  'A legendary burrow brimming with warmth, chaos, and the very best kind of magic.',
];

export async function seedListings(hostId, firstName, lastName) {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      'SELECT id FROM listings WHERE host_id = $1 AND is_seeded = true',
      [hostId]
    );
    if (existing.length > 0) {
      return { ok: false, message: `You already have ${existing.length} seeded listing(s). Unseed them first.` };
    }

    const { rows: cities } = await client.query(
      `SELECT c.id AS city_id, c.name AS city, r.id AS region_id, r.name AS region,
              w.id AS world_id, w.name AS world
       FROM cities c
       JOIN regions r ON c.region_id = r.id
       JOIN worlds  w ON r.world_id  = w.id
       ORDER BY w.name, r.name, c.name
       LIMIT 30`
    );

    if (cities.length < 30) {
      await seedLocations(client);
      const { rows: reloaded } = await client.query(
        `SELECT c.id AS city_id, c.name AS city, r.id AS region_id, r.name AS region,
                w.id AS world_id, w.name AS world
         FROM cities c
         JOIN regions r ON c.region_id = r.id
         JOIN worlds  w ON r.world_id  = w.id
         ORDER BY w.name, r.name, c.name
         LIMIT 30`
      );
      cities.push(...reloaded);
    }

    for (let i = 0; i < TEMPLATES.length; i++) {
      const t    = TEMPLATES[i];
      const city = cities[i];

      await client.query(
        `INSERT INTO listings
          (host_id, title, description, address, city, region, world,
           city_id, region_id, world_id,
           price_per_night, max_guests, bedrooms, bathrooms,
           property_type, status, is_seeded)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true)`,
        [
          hostId,
          `${t.title} - ${initials}`,
          DESCRIPTIONS[i],
          `${t.address} [${initials}], ${city.city}`,
          city.city, city.region, city.world,
          city.city_id, city.region_id, city.world_id,
          t.pricePerNight, t.maxGuests, t.bedrooms, t.bathrooms,
          t.propertyType, t.status,
        ]
      );
    }

    await client.query('COMMIT');
    return { ok: true, message: '30 listings seeded successfully.' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function unseedListings(hostId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: deleted } = await client.query(
      'DELETE FROM listings WHERE host_id = $1 AND is_seeded = true RETURNING title',
      [hostId]
    );

    if (deleted.length === 0) {
      return { ok: false, message: 'No seeded listings found to remove.' };
    }

    await client.query('COMMIT');
    return { ok: true, message: `${deleted.length} seeded listing(s) removed successfully.` };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
