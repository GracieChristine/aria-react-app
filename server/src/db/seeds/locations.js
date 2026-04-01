import pool from '../pool.js';

const data = [
  // ── EVERREALM ──────────────────────────────────────────────────────────────
  {
    name: 'Everrealm',
    slug: 'everrealm',
    worlds: [
      {
        name: 'Arendelle',
        description: 'A Scandinavian-inspired kingdom of ice and snow.',
        regions: [
          {
            name: 'The Kingdom',
            description: 'The royal heart of Arendelle, home to the castle and the fjord village.',
            cities: [
              { name: 'Arendelle City',       description: 'The bustling port capital of the kingdom.' },
              { name: 'The Ice Palace',        description: "Elsa's isolated fortress high in the mountains." },
            ],
          },
          {
            name: 'The Enchanted Forest',
            description: 'A mystical woodland beyond the kingdom, shrouded in mist.',
            cities: [
              { name: 'Northuldra Camp',       description: 'The nomadic settlement of the Northuldra people.' },
              { name: 'The Dark Sea',          description: "A treacherous stretch of ocean at the forest's edge." },
            ],
          },
        ],
      },
      {
        name: 'Atlantica',
        description: 'An underwater kingdom beneath the sea.',
        regions: [
          {
            name: 'The Deep',
            description: 'The vast ocean floor where merfolk live and thrive.',
            cities: [
              { name: 'Atlantis',              description: 'The grand sunken city, capital of the ocean realm.' },
              { name: "King Triton's Court",   description: 'The royal palace complex at the heart of Atlantica.' },
            ],
          },
          {
            name: 'The Coral Reef',
            description: 'A colourful labyrinth of coral just beyond the palace walls.',
            cities: [
              { name: "Ariel's Grotto",        description: 'A hidden cove filled with human treasures.' },
              { name: 'Sunken Ship Cove',      description: 'An eerie graveyard of shipwrecks on the ocean floor.' },
            ],
          },
        ],
      },
      {
        name: 'The Pride Lands',
        description: 'The vast African savanna ruled by the lion kings.',
        regions: [
          {
            name: 'Pride Rock',
            description: 'The iconic rocky outcrop at the centre of the Pride Lands.',
            cities: [
              { name: 'Pride Rock Summit',     description: 'The ceremonial peak where kings are presented.' },
              { name: 'The Watering Hole',     description: 'A peaceful gathering spot for all the animals.' },
            ],
          },
          {
            name: 'The Elephant Graveyard',
            description: 'A desolate, fog-filled wasteland beyond the borders.',
            cities: [
              { name: 'The Shadowlands',       description: "Scar's dark territory of scorched earth and ash." },
            ],
          },
        ],
      },
      {
        name: 'Neverland',
        description: 'A magical island where children never grow up.',
        regions: [
          {
            name: 'Mermaid Lagoon',
            description: 'A shimmering cove where mermaids sun themselves on the rocks.',
            cities: [
              { name: 'Skull Rock',            description: 'A dramatic sea cave used as a pirate hideout.' },
              { name: 'Mermaid Cove',          description: 'The calm inlet where the mermaids gather.' },
            ],
          },
          {
            name: 'Pixie Hollow',
            description: 'A fairy village nestled inside an ancient oak tree.',
            cities: [
              { name: "Tinker's Workshop",     description: 'The bustling hub where tinker fairies craft their tools.' },
              { name: 'The Fairy Circle',      description: 'A magical clearing at the heart of Pixie Hollow.' },
            ],
          },
        ],
      },
      {
        name: 'The Enchanted Province',
        description: "A fairytale French countryside under the shadow of the Beast's curse.",
        regions: [
          {
            name: "The Beast's Estate",
            description: 'A vast, enchanted estate surrounding the cursed castle.',
            cities: [
              { name: "The Beast's Castle",    description: "A grand but gloomy castle brought to life by an enchantress's curse." },
              { name: 'The West Wing',         description: 'The forbidden wing of the castle where the enchanted rose is kept.' },
              { name: 'The Ballroom',          description: 'The magnificent golden ballroom where magic fills the air.' },
            ],
          },
          {
            name: 'The Village',
            description: 'A quaint provincial town nestled at the edge of the dark forest.',
            cities: [
              { name: "Belle's Village",       description: "A charming little town where Belle dreams of adventure." },
              { name: "Gaston's Tavern",       description: "The rowdy tavern where Gaston holds court every evening." },
              { name: "Maurice's Workshop",    description: "The eccentric inventor's cottage on the edge of town." },
            ],
          },
        ],
      },
      {
        name: 'Corona',
        description: "Rapunzel's sun-drenched kingdom, famous for its floating lantern festival.",
        regions: [
          {
            name: 'The Royal Capital',
            description: 'The walled city-kingdom perched on an island, lit gold every year by lanterns.',
            cities: [
              { name: 'Corona Castle',         description: "The grand castle home of Rapunzel's family and the royal court." },
              { name: 'The Kingdom Square',    description: 'The lively central square where the lantern festival is celebrated.' },
              { name: 'The Snuggly Duckling',  description: 'A rough-and-tumble tavern frequented by ruffians with hidden dreams.' },
            ],
          },
          {
            name: 'The Wilderness',
            description: "The forests and valleys beyond Corona's walls, full of secrets.",
            cities: [
              { name: "Rapunzel's Tower",      description: 'The hidden tower where Rapunzel was kept for eighteen years.' },
              { name: 'The Dark Forest',       description: 'An ominous stretch of woodland between the tower and the kingdom.' },
            ],
          },
        ],
      },
      {
        name: 'The Kingdom of Far Far Away',
        description: "Shrek's fairy-tale realm, a world of ogres, talking donkeys, and self-important royals.",
        regions: [
          {
            name: 'Far Far Away',
            description: "The gleaming, Hollywood-esque royal capital of the fairy-tale world.",
            cities: [
              { name: 'Far Far Away Palace',   description: "The ostentatious royal palace of Princess Fiona's family." },
              { name: 'Far Far Away Boulevard', description: 'The glitzy main street lined with fairy-tale celebrity boutiques.' },
            ],
          },
          {
            name: "Shrek's Swamp",
            description: "A peaceful, muddy bog that Shrek calls home — trespassers not welcome.",
            cities: [
              { name: "Shrek's Cottage",       description: "A cosy mud-brick cottage in the heart of the swamp." },
              { name: 'Duloc',                 description: "Lord Farquaad's obsessively perfect miniature kingdom." },
            ],
          },
        ],
      },
      {
        name: 'The Enchanted Kingdom',
        description: "Snow White's fairytale realm of dark forests, dwarves, and a poisoned apple.",
        regions: [
          {
            name: "The Queen's Domain",
            description: "The dark, imposing kingdom ruled by the Evil Queen.",
            cities: [
              { name: "The Evil Queen's Castle", description: "A forbidding castle where the Queen consults her magic mirror." },
              { name: 'The Dungeon',            description: "The Queen's gloomy underground prison beneath the castle." },
            ],
          },
          {
            name: 'The Woodland',
            description: "The enchanted forest and hills where Snow White found refuge.",
            cities: [
              { name: "The Dwarfs' Cottage",   description: "A cheerful little cottage in the woods, home to the seven dwarfs." },
              { name: 'The Wishing Well',      description: "A stone well in the woodland clearing where Snow White sang." },
            ],
          },
        ],
      },
      {
        name: 'The Sleeping Kingdom',
        description: "Aurora's realm, frozen in a century-long slumber by a dark fairy's curse.",
        regions: [
          {
            name: 'The Royal Court',
            description: "The grand kingdom that fell under Maleficent's spell.",
            cities: [
              { name: "King Stefan's Castle",  description: "The royal castle where Aurora was cursed at her christening." },
              { name: 'The Great Hall',        description: "The magnificent hall where the fateful royal celebration was held." },
            ],
          },
          {
            name: 'The Moors',
            description: "The wild, magical borderlands between the human kingdom and the fairy realm.",
            cities: [
              { name: "Maleficent's Moors",    description: "The enchanted moorland domain ruled by the dark fairy." },
              { name: 'The Cottage in the Woods', description: "The hidden woodland cottage where Aurora was raised by the three good fairies." },
            ],
          },
        ],
      },
      {
        name: 'The Dragon Realm',
        description: "Mulan's ancient China — a land of honour, dragons, and the Great Wall.",
        regions: [
          {
            name: 'The Imperial Capital',
            description: "The seat of the Emperor, the heart of the dynasty.",
            cities: [
              { name: 'The Imperial Palace',   description: "The Emperor's vast palace complex at the centre of the capital." },
              { name: 'The Imperial Garden',   description: "Serene gardens of lotus ponds and cherry blossoms within the palace walls." },
            ],
          },
          {
            name: "Mulan's Village",
            description: "A humble village in the countryside, home to the Fa family.",
            cities: [
              { name: 'Fa Family Village',     description: "A quiet farming village where the Fa family tends their ancestral home." },
              { name: 'The Ancestral Temple',  description: "A sacred temple where the Fa family honours their ancestors." },
            ],
          },
          {
            name: 'The Northern Front',
            description: "The treacherous mountains and passes where the Hun army invaded.",
            cities: [
              { name: 'Tung Shao Pass',        description: "A snow-covered mountain pass where the fate of China was decided." },
              { name: 'The Great Wall',        description: "The ancient fortified wall marking the edge of the empire." },
            ],
          },
        ],
      },
    ],
  },

  // ── AETHERIA ───────────────────────────────────────────────────────────────
  {
    name: 'Aetheria',
    slug: 'aetheria',
    worlds: [
      {
        name: 'Scholastica',
        description: 'The world of magical academies, great libraries, and the pursuit of arcane knowledge.',
        regions: [
          {
            name: 'Hogwarts',
            description: 'The ancient Scottish school of witchcraft and wizardry.',
            cities: [
              { name: 'Hogwarts Castle',       description: 'The magnificent castle perched above the Black Lake.' },
              { name: 'Hogsmeade',             description: 'The only all-wizard village in Britain, just outside the school gates.' },
              { name: 'The Forbidden Forest',  description: "A vast, dangerous woodland at the castle's edge." },
              { name: 'The Black Lake',        description: 'A deep, dark lake home to the Giant Squid and the Merpeople.' },
            ],
          },
          {
            name: 'Beauxbatons',
            description: 'The prestigious French academy of magic, known for elegance and refinement.',
            cities: [
              { name: 'Beauxbatons Palace',    description: 'The magnificent palace school of magic set in the French mountains.' },
              { name: 'The Formal Gardens',    description: 'Immaculate landscaped gardens surrounding the palace grounds.' },
              { name: 'The Carriage Stables',  description: 'Where the enormous Beauxbatons flying carriages are housed.' },
            ],
          },
          {
            name: 'Durmstrang',
            description: 'The secretive northern school of magic with a reputation for the Dark Arts.',
            cities: [
              { name: 'Durmstrang Institute',  description: 'The forbidding castle school hidden somewhere in the far north.' },
              { name: 'The Ship Harbour',      description: 'The frozen port where the Durmstrang ship is anchored.' },
              { name: 'The Dark Tower',        description: 'The oldest and most secretive part of the Durmstrang castle.' },
            ],
          },
          {
            name: 'Ilvermorny',
            description: 'The North American school of magic, founded on Mount Greylock in Massachusetts.',
            cities: [
              { name: 'Ilvermorny Castle',     description: 'The grand American school of witchcraft and wizardry at the summit of Mount Greylock.' },
              { name: 'The Sorting Courtyard', description: 'The stone courtyard where new students are sorted into their houses.' },
              { name: 'No-Maj Boundary',       description: 'The enchanted perimeter keeping Ilvermorny hidden from non-magical Americans.' },
            ],
          },
        ],
      },
      {
        name: 'Urbanis',
        description: 'The hidden wizarding society woven invisibly into the fabric of the Muggle world.',
        regions: [
          {
            name: 'Diagon Alley',
            description: "London's secret magical shopping district, hidden behind the Leaky Cauldron.",
            cities: [
              { name: 'Diagon Alley',          description: 'The main cobblestone street of wizarding shops.' },
              { name: 'Knockturn Alley',        description: 'A shadowy side alley dealing in Dark Arts supplies.' },
              { name: 'Gringotts Bank',         description: 'The towering goblin-run bank at the top of Diagon Alley.' },
              { name: 'The Leaky Cauldron',     description: 'The dingy pub that serves as the gateway between Muggle London and Diagon Alley.' },
            ],
          },
          {
            name: 'The Ministry Quarter',
            description: 'Underground London, home to the Ministry of Magic.',
            cities: [
              { name: 'Ministry of Magic',     description: 'The grand underground headquarters of British wizarding government.' },
              { name: 'Azkaban Island',         description: 'A remote fortress prison in the North Sea.' },
              { name: "Godric's Hollow",        description: "A historic wizarding village and the site of Voldemort's first defeat." },
            ],
          },
          {
            name: 'The Wizarding Suburbs',
            description: "Ordinary-looking streets hiding extraordinary wizarding households.",
            cities: [
              { name: 'Grimmauld Place',        description: "The ancient Black family townhouse, headquarters of the Order of the Phoenix." },
              { name: 'Spinner\'s End',          description: "A gloomy terraced street where Severus Snape grew up." },
              { name: 'Ottery St Catchpole',    description: "The Devon village where the Weasley family's Burrow stands." },
            ],
          },
        ],
      },
      {
        name: 'Beastiara',
        description: 'The wild, globe-spanning world of magical creatures and the wizards who study them.',
        regions: [
          {
            name: 'New York',
            description: 'MACUSA territory — the Magical Congress of the United States of America.',
            cities: [
              { name: 'MACUSA Headquarters',   description: 'The American magical government building inside the Woolworth Building.' },
              { name: 'The Blind Pig',          description: 'A speakeasy for witches and wizards in Prohibition-era New York.' },
              { name: "Newt's Case",            description: "The impossibly large magical habitat inside Newt Scamander's leather suitcase." },
            ],
          },
          {
            name: 'Paris',
            description: 'Home to the French Ministry of Magic and the Lestrange family vault.',
            cities: [
              { name: 'French Ministry',       description: 'The Parisian seat of French magical authority.' },
              { name: 'Circus Arcanus',         description: 'A travelling wizarding circus hiding dark secrets.' },
              { name: 'The Lestrange Vault',    description: "A labyrinthine underground vault beneath Paris's magical archives." },
            ],
          },
        ],
      },
    ],
  },

  // ── SOVERIE ────────────────────────────────────────────────────────────────
  {
    name: 'Soverie',
    slug: 'soverie',
    worlds: [
      {
        name: 'The Baker Street Quarters',
        description: "The fog-drenched London of Sherlock Holmes — a city of gas lamps, mysteries, and the world's greatest detective.",
        regions: [
          {
            name: 'Baker Street & London',
            description: "The grimy, brilliant heart of Holmes's London — from his legendary lodgings to the halls of Scotland Yard.",
            cities: [
              { name: '221B Baker Street',     description: "The famous first-floor flat where Sherlock Holmes and Dr Watson solved the world's greatest mysteries." },
              { name: 'Scotland Yard',         description: "The headquarters of the Metropolitan Police, frequently consulted — and occasionally bested — by Holmes." },
              { name: 'The Diogenes Club',     description: "Mycroft Holmes's eccentric gentlemen's club where conversation is strictly forbidden." },
              { name: 'Whitechapel',           description: "The shadowy East End district, a labyrinth of alleys and dangerous cases." },
              { name: 'The Criterion Bar',     description: "The Strand bar where Watson first heard Holmes's name mentioned — the starting point of it all." },
            ],
          },
          {
            name: 'The English Countryside',
            description: "The rolling moors and grand estates beyond London, where some of Holmes's darkest cases unfolded.",
            cities: [
              { name: 'Baskerville Hall',      description: "The ancient Devonshire manor at the centre of the legend of the hound." },
              { name: 'Dartmoor',              description: "The bleak, fog-shrouded moor where the Baskerville curse seemed most alive." },
              { name: 'Briony Lodge',          description: "The St John's Wood villa of Irene Adler — the woman who outwitted Holmes." },
            ],
          },
          {
            name: 'Beyond England',
            description: "The international reaches of Holmes's adventures — from Swiss waterfalls to European capitals.",
            cities: [
              { name: 'Reichenbach Falls',     description: "The thundering Swiss waterfall where Holmes and Moriarty fought their final battle." },
              { name: 'Montague Street',       description: "The quiet London street where Holmes lodged before Baker Street, in his early years." },
              { name: 'The Reichenbach Hotel', description: "The Swiss inn near the falls, from which Holmes vanished for three years." },
            ],
          },
        ],
      },
      {
        name: "The Lupin's Gambit",
        description: "The glittering and shadowy France of Arsène Lupin — gentleman burglar, master of disguise, and thorn in the side of every gendarme in Europe.",
        regions: [
          {
            name: 'Paris',
            description: "The city of lights and secrets — Lupin's home turf, from the Louvre to the Parisian underworld.",
            cities: [
              { name: 'The Louvre',            description: "The great museum from which Lupin famously stole — and sometimes returned — priceless works." },
              { name: 'Château de Thibermesnil', description: "A medieval Norman château where Lupin hid his most treasured secrets behind a hidden passage." },
              { name: 'The Préfecture de Police', description: "The Paris police headquarters whose detectives eternally chased Lupin without success." },
              { name: 'Montmartre',            description: "The bohemian hilltop district of artists and cabarets where Lupin kept anonymous lodgings." },
            ],
          },
          {
            name: 'The French Countryside',
            description: "The châteaux, cliffs, and coastal hideaways of provincial France — Lupin's favourite hunting grounds.",
            cities: [
              { name: "Château de l'Aiguille", description: "A remote château tangled up in the legend of the Hollow Needle — one of Lupin's greatest mysteries." },
              { name: 'Étretat Cliffs',        description: "The dramatic white chalk cliffs of Normandy concealing the Hollow Needle, Lupin's ultimate secret lair." },
              { name: 'The Norman Coast',      description: "The rugged coastline of Normandy, scattered with hidden coves and smugglers' paths." },
            ],
          },
          {
            name: 'Beyond France',
            description: "The international stage where Lupin's reputation preceded him across borders.",
            cities: [
              { name: 'Monte Carlo',           description: "The glittering principality where Lupin operated among the wealthy at the casino tables." },
              { name: "Lupin's London Hideout", description: "A discreet Mayfair address where Lupin operated under one of his many English aliases." },
            ],
          },
        ],
      },
      {
        name: 'The Ton',
        description: "The dazzling, gossip-laden world of Regency London high society — where every ball, betrothal, and scandal is observed and reported.",
        regions: [
          {
            name: 'London Season',
            description: "The social whirlwind of Regency London, where reputations are made and destroyed in a single evening.",
            cities: [
              { name: 'Bridgerton House',      description: "The elegant Mayfair townhouse of the Bridgerton family, the heart of the social season." },
              { name: 'Danbury House',         description: "The formidable Lady Danbury's London residence — the place to be seen and heard." },
              { name: 'The Modiste',           description: "Madame Delacroix's exclusive dressmaker's shop, where the season's fashions are created and gossip exchanged." },
              { name: 'Hyde Park',             description: "The fashionable promenade ground where the ton takes its morning rides and afternoon strolls." },
              { name: "Almack's Assembly Rooms", description: "The most exclusive ballroom in London — a voucher to enter is the most coveted prize of the season." },
            ],
          },
          {
            name: 'The Country Estates',
            description: "The grand houses and parklands outside London where the ton retreats between seasons.",
            cities: [
              { name: 'Aubrey Hall',           description: "The sprawling Bridgerton country estate in Kent, scene of house parties and quiet revelations." },
              { name: 'Clyvedon Castle',       description: "The Duke of Hastings's magnificent ancestral castle — grand, remote, and full of history." },
            ],
          },
        ],
      },
      {
        name: 'The Austen Circle',
        description: "The drawing rooms, country estates, and seaside lodgings of Jane Austen's England — where wit, manners, and matters of the heart reign supreme.",
        regions: [
          {
            name: 'Pride & Prejudice',
            description: "The Hertfordshire countryside and Derbyshire estates of the Bennet family and Mr Darcy.",
            cities: [
              { name: 'Pemberley',             description: "Mr Darcy's magnificent Derbyshire estate — the house that changed Elizabeth Bennet's opinion entirely." },
              { name: 'Longbourn',             description: "The modest Bennet family home in Hertfordshire, full of noise, nerves, and five unmarried daughters." },
              { name: 'Netherfield Park',      description: "The grand neighbouring estate leased by Mr Bingley, setting of the first fateful ball." },
              { name: 'Rosings Park',          description: "Lady Catherine de Bourgh's imposing estate in Kent, where condescension is served with every meal." },
              { name: 'Meryton',              description: "The nearby market town where the Bennet sisters shopped, gossiped, and encountered the militia." },
            ],
          },
          {
            name: 'Emma',
            description: "The village of Highbury in Surrey — a small world of neighbours, matchmaking, and misunderstandings.",
            cities: [
              { name: 'Hartfield',             description: "The comfortable Woodhouse family home at the edge of Highbury village." },
              { name: 'Donwell Abbey',         description: "Mr Knightley's ancient and handsome estate — everything that is English and good." },
              { name: 'Randalls',              description: "The modest but cheerful home of the newly married Westons, always welcoming company." },
              { name: 'The Crown Inn',         description: "Highbury's inn and ballroom, venue for the village's most anticipated social gatherings." },
              { name: 'Highbury Village',      description: "The small, self-contained Surrey village that forms the entire world of Emma's social life." },
            ],
          },
          {
            name: 'Sense & Sensibility',
            description: "The Sussex and Devonshire homes of the Dashwood sisters — a story of heart versus head.",
            cities: [
              { name: 'Norland Park',          description: "The ancestral Sussex estate the Dashwood women must leave after Mr Dashwood's death." },
              { name: 'Barton Cottage',        description: "The small but comfortable Devonshire cottage the Dashwoods retire to — their new beginning." },
              { name: 'Barton Park',           description: "The nearby estate of Sir John Middleton, whose hospitality anchors the Dashwoods in Devon." },
              { name: 'Cleveland',             description: "The Palmer family's Somerset estate where Marianne's illness reaches its crisis." },
              { name: 'Delaford Manor',        description: "Colonel Brandon's quiet and comfortable Dorset estate — a home that eventually offers shelter and love." },
            ],
          },
          {
            name: 'Bath & Beyond',
            description: "The spa city of Bath and the coastal estates of Austen's other novels — Persuasion, Northanger Abbey.",
            cities: [
              { name: 'Royal Crescent',        description: "Bath's most prestigious address — the sweeping Georgian terrace where the fashionable world paraded." },
              { name: 'The Pump Room',         description: "Bath's social hub where visitors took the waters, exchanged gossip, and made connections." },
              { name: 'Camden Place',          description: "Sir Walter Elliot's rented Bath townhouse — chosen for its fashionable address over all else." },
              { name: 'Kellynch Hall',         description: "The Elliot family seat in Somerset, which Sir Walter is forced to let in Persuasion." },
              { name: 'Northanger Abbey',      description: "The ancient Gothic abbey of the Tilney family — thrillingly sinister in Catherine Morland's imagination." },
            ],
          },
        ],
      },
    ],
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const universe of data) {
      const { rows: [u] } = await client.query(
        `INSERT INTO universes (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [universe.name, universe.slug]
      );

      for (const world of universe.worlds) {
        const { rows: [w] } = await client.query(
          `INSERT INTO worlds (universe_id, name, description)
           VALUES ($1, $2, $3)
           ON CONFLICT (universe_id, name) DO UPDATE SET description = EXCLUDED.description
           RETURNING id`,
          [u.id, world.name, world.description]
        );

        for (const region of world.regions) {
          const { rows: [r] } = await client.query(
            `INSERT INTO regions (world_id, name, description)
             VALUES ($1, $2, $3)
             ON CONFLICT (world_id, name) DO UPDATE SET description = EXCLUDED.description
             RETURNING id`,
            [w.id, region.name, region.description]
          );

          for (const city of region.cities) {
            await client.query(
              `INSERT INTO cities (region_id, name, description)
               VALUES ($1, $2, $3)
               ON CONFLICT (region_id, name) DO UPDATE SET description = EXCLUDED.description`,
              [r.id, city.name, city.description]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Locations seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
