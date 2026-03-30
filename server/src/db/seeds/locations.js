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

  // ── REGALIA ────────────────────────────────────────────────────────────────
  {
    name: 'Regalia',
    slug: 'regalia',
    worlds: [
      {
        name: 'Victorian England',
        description: 'The reign of Queen Victoria (1837–1901) — an age of industry, empire, and grand estates.',
        regions: [
          {
            name: 'London',
            description: 'The vast, fog-laden capital at the height of the British Empire.',
            cities: [
              { name: 'Buckingham Palace',     description: "The Queen's official London residence and the seat of the monarchy." },
              { name: 'Kensington Palace',     description: "A royal palace within Kensington Gardens, favoured by Queen Victoria." },
              { name: 'Westminster',           description: 'The political and ceremonial heart of the empire.' },
              { name: 'Crystal Palace',        description: "The revolutionary glass and iron exhibition hall built for the Great Exhibition of 1851." },
              { name: 'Brighton Pavilion',     description: "The Prince Regent's extravagant seaside palace on the Sussex coast." },
            ],
          },
          {
            name: 'The Scottish Highlands',
            description: "The rugged, romantic landscape where Victoria retreated from court life.",
            cities: [
              { name: 'Balmoral Castle',       description: "The royal family's Scottish Highland retreat, purchased by Victoria in 1852." },
              { name: 'Holyrood Palace',        description: "The official Scottish residence of the British monarch in Edinburgh." },
            ],
          },
          {
            name: 'The English Countryside',
            description: "The rolling estates and manor houses of rural Victorian England.",
            cities: [
              { name: 'Windsor Castle',        description: "The oldest and largest occupied castle in the world, a royal residence since the 11th century." },
              { name: 'Chatsworth House',      description: "One of England's grandest country houses, seat of the Duke of Devonshire." },
              { name: 'Longleat',              description: "A magnificent Elizabethan house set within a vast landscaped park in Wiltshire." },
            ],
          },
        ],
      },
      {
        name: 'Elizabethan England',
        description: "The reign of Elizabeth I (1558–1603) — the Golden Age of exploration, theatre, and courtly intrigue.",
        regions: [
          {
            name: 'The Royal Court',
            description: "The itinerant court of Elizabeth I, moving between her great palaces.",
            cities: [
              { name: 'Hampton Court Palace',  description: "A magnificent red-brick palace on the Thames, shared with Henry VIII and later Elizabeth." },
              { name: 'Whitehall Palace',      description: "The principal royal residence in London throughout the Tudor period." },
              { name: 'Greenwich Palace',      description: "Elizabeth I's birthplace, a grand riverside palace east of London." },
              { name: 'Richmond Palace',       description: "A favourite Thames-side retreat where Elizabeth I spent her final years." },
              { name: 'Nonsuch Palace',        description: "Henry VIII's fantastical pleasure palace, considered the most ornate in England." },
            ],
          },
          {
            name: 'The City',
            description: "London beyond the palace walls — theatres, merchants, and the Tower.",
            cities: [
              { name: 'The Tower of London',   description: "The ancient fortress serving as royal palace, prison, and treasury." },
              { name: 'Kenilworth Castle',     description: "A grand Warwickshire castle where Robert Dudley hosted Elizabeth for nineteen lavish days." },
              { name: 'The Globe Theatre',     description: "Shakespeare's iconic open-air playhouse on the south bank of the Thames." },
            ],
          },
        ],
      },
      {
        name: 'Versailles, France',
        description: "The court of the Sun King, Louis XIV (1643–1715) — the pinnacle of French royal grandeur.",
        regions: [
          {
            name: 'The Palace Grounds',
            description: "The breathtaking palace and its immediate royal apartments.",
            cities: [
              { name: 'Hall of Mirrors',       description: "The dazzling gallery of 357 mirrors reflecting the gardens of Versailles." },
              { name: "The King's Apartments", description: "The formal state rooms at the heart of Louis XIV's palace." },
              { name: 'The Chapel Royal',      description: "The exquisite gilded royal chapel where the court attended daily Mass." },
              { name: 'Grand Trianon',          description: "A smaller marble palace built as a private retreat for the King." },
              { name: 'Petit Trianon',          description: "An intimate neoclassical château within the grounds, later favoured by Marie Antoinette." },
            ],
          },
          {
            name: 'The Gardens',
            description: "André Le Nôtre's perfectly geometric formal gardens stretching to the horizon.",
            cities: [
              { name: 'The Grand Canal',       description: "A vast cruciform waterway at the centre of the Versailles gardens." },
              { name: 'The Orangerie',          description: "A grand greenhouse sheltering thousands of orange trees through the French winters." },
              { name: 'The Fountain Grove',    description: "Hidden groves of sculpted fountains and mythological statuary." },
            ],
          },
        ],
      },
      {
        name: 'Imperial Japan',
        description: "The feudal and Edo-period Japan of shoguns, samurai, and sacred shrines.",
        regions: [
          {
            name: 'The Imperial Court',
            description: "Kyoto — the ancient imperial capital of Japan.",
            cities: [
              { name: 'Kyoto Imperial Palace', description: "The traditional residence of the Japanese Emperor in the heart of Kyoto." },
              { name: 'Nijo Castle',           description: "A flat-land castle built by Tokugawa Ieyasu, famous for its nightingale floors." },
              { name: 'Fushimi Inari Shrine',  description: "The iconic shrine of ten thousand vermilion torii gates winding up Mount Inari." },
            ],
          },
          {
            name: 'The Shogunate',
            description: "Edo (modern Tokyo) — the seat of the Tokugawa shogunate.",
            cities: [
              { name: 'Edo Castle',            description: "The largest castle complex in the world, seat of the Tokugawa shogunate." },
              { name: 'Osaka Castle',          description: "A magnificent five-storey castle towering over the city of Osaka." },
              { name: 'Hiroshima Castle',      description: "A graceful feudal castle on the delta of the Ōta River, known as the Carp Castle." },
            ],
          },
          {
            name: 'The Sacred Lands',
            description: "Japan's most revered spiritual and natural landmarks.",
            cities: [
              { name: 'Mount Fuji',            description: "Japan's iconic snow-capped volcano and most sacred site." },
              { name: 'Nikko Toshogu',          description: "An ornate mausoleum shrine complex in the mountains of Nikko." },
              { name: 'Ise Grand Shrine',      description: "The holiest Shinto shrine in Japan, dedicated to the goddess Amaterasu." },
            ],
          },
        ],
      },
      {
        name: 'Ancient Egypt',
        description: "The age of the Pharaohs — a civilisation of gods, pyramids, and the eternal Nile.",
        regions: [
          {
            name: 'Upper Egypt',
            description: "The southern Nile Valley, home to the greatest temples and royal tombs.",
            cities: [
              { name: 'Valley of the Kings',   description: "The royal necropolis cut into the limestone cliffs of Luxor." },
              { name: 'Karnak Temple',          description: "The vast temple complex dedicated to Amun, the largest religious site in the ancient world." },
              { name: 'Luxor Temple',           description: "A grand temple on the east bank of the Nile, connected to Karnak by an avenue of sphinxes." },
              { name: 'Abu Simbel',             description: "Two massive rock temples carved by Ramesses II in the mountainside of Nubia." },
            ],
          },
          {
            name: 'Lower Egypt',
            description: "The northern Nile Valley and the great monuments of the Giza plateau.",
            cities: [
              { name: 'Memphis',               description: "The ancient capital of Egypt, once the largest city in the world." },
              { name: 'Giza Plateau',           description: "Home to the Great Pyramid, the Pyramid of Khafre, and the Great Sphinx." },
              { name: 'The Great Sphinx',       description: "The colossal limestone guardian of the Giza necropolis." },
            ],
          },
          {
            name: 'The Nile Delta',
            description: "The fertile fan of the Nile where it meets the Mediterranean.",
            cities: [
              { name: 'Alexandria',             description: "The great Hellenistic port city founded by Alexander, home to the famous Library." },
              { name: 'Rosetta',               description: "The delta town where the Rosetta Stone was discovered, key to deciphering hieroglyphs." },
              { name: 'Tanis',                 description: "An ancient city in the eastern delta, a royal capital of the late New Kingdom." },
            ],
          },
        ],
      },
      {
        name: 'Ancient Rome',
        description: "The Roman Empire at its height — a world of senators, gladiators, and marble temples.",
        regions: [
          {
            name: 'The Imperial City',
            description: "Rome itself — the eternal city at the centre of the known world.",
            cities: [
              { name: 'The Roman Forum',       description: "The ancient heart of Roman civic life, surrounded by temples and basilicas." },
              { name: 'The Colosseum',          description: "The iconic amphitheatre where 50,000 Romans watched gladiatorial combat." },
              { name: 'The Palatine Hill',      description: "The most central of Rome's seven hills, home to the imperial palaces." },
              { name: 'The Pantheon',           description: "A perfectly preserved temple to all the gods, with its remarkable domed roof." },
            ],
          },
          {
            name: 'The Provinces',
            description: "The far-flung territories of the Roman Empire.",
            cities: [
              { name: 'Pompeii',               description: "A prosperous Roman city frozen in time by the eruption of Vesuvius in 79 AD." },
              { name: 'Carthage',              description: "The great North African city, once Rome's greatest rival." },
              { name: 'Alexandria',             description: "Rome's most important eastern city, seat of learning and commerce on the Nile." },
            ],
          },
        ],
      },
      {
        name: 'Romanov Russia',
        description: "Imperial Russia under the Romanov dynasty (1613–1917) — a world of opulent palaces and vast frozen estates.",
        regions: [
          {
            name: 'St. Petersburg',
            description: "Peter the Great's magnificent capital built on the Neva delta.",
            cities: [
              { name: 'Winter Palace',          description: "The breathtaking baroque palace on the Neva, official residence of the Russian Emperors." },
              { name: 'Catherine Palace',       description: "The dazzling blue-and-gold palace in Tsarskoye Selo, containing the legendary Amber Room." },
              { name: 'Peterhof',               description: "The 'Russian Versailles' — a palace complex famous for its cascading fountains." },
              { name: 'Tsarskoye Selo',         description: "The imperial residence and park complex south of St. Petersburg." },
            ],
          },
          {
            name: 'Moscow',
            description: "The ancient capital and spiritual heart of Russia.",
            cities: [
              { name: 'The Kremlin',            description: "The fortified complex at the centre of Moscow, seat of tsarist power." },
              { name: 'Red Square',             description: "The iconic cobblestone square adjoining the Kremlin, lined with colourful domed cathedrals." },
              { name: 'Novodevichy Convent',    description: "A stunning 16th-century walled convent where noblewomen were exiled and tsars were buried." },
            ],
          },
          {
            name: 'The Imperial Estates',
            description: "The grand country palaces scattered across the Russian countryside.",
            cities: [
              { name: 'Pavlovsk Palace',        description: "A neoclassical palace set within a vast English-style landscape park south of St. Petersburg." },
              { name: 'Gatchina Palace',        description: "A severe yet grand palace surrounded by lakes, favoured by Paul I." },
              { name: 'Oranienbaum',            description: "The most intact of the imperial palace ensembles, never occupied by German forces." },
            ],
          },
        ],
      },
      {
        name: 'Imperial China',
        description: "The dynasties of imperial China — a civilisation of emperors, scholars, and sacred rites.",
        regions: [
          {
            name: 'The Forbidden City',
            description: "The walled imperial palace complex in Beijing, forbidden to common people for five centuries.",
            cities: [
              { name: 'The Outer Court',        description: "The ceremonial southern half of the Forbidden City, site of great state occasions." },
              { name: 'The Inner Court',        description: "The northern residential half where the Emperor and his family lived." },
              { name: 'The Imperial Garden',    description: "A serene garden of rockeries, ancient cypresses, and pavilions at the northern end of the palace." },
            ],
          },
          {
            name: 'Beyond the Walls',
            description: "The great imperial sites of Beijing and beyond.",
            cities: [
              { name: 'The Summer Palace',      description: "A vast ensemble of lakes, gardens, and palaces used as an imperial retreat." },
              { name: 'The Temple of Heaven',   description: "The sacred complex where emperors performed rites to Heaven for good harvests." },
              { name: 'The Old Town',           description: "The ancient hutong neighbourhoods of narrow alleys and courtyard residences." },
            ],
          },
        ],
      },
      {
        name: 'Ancient Greece',
        description: "The Classical era of city-states, philosophers, and the gods of Olympus.",
        regions: [
          {
            name: 'Athens',
            description: "The birthplace of democracy, philosophy, and the arts.",
            cities: [
              { name: 'The Acropolis',          description: "The sacred rock of Athens, crowned by the Parthenon and visible across the city." },
              { name: 'The Parthenon',          description: "The magnificent temple to Athena Parthenos, the defining monument of ancient Greece." },
              { name: 'The Agora',              description: "The bustling heart of Athenian civic life — marketplace, law courts, and philosophical debate." },
              { name: 'Theatre of Dionysus',    description: "The world's first theatre, carved into the slopes of the Acropolis." },
            ],
          },
          {
            name: 'Sparta',
            description: "The formidable city-state of warriors, discipline, and martial glory.",
            cities: [
              { name: 'The Spartan Agoge',      description: "The legendary training ground where Spartan boys were forged into soldiers." },
              { name: 'The Temple of Athena',   description: "The bronze-clad temple to Athena of the Brazen House, the city's sacred centre." },
              { name: 'Laconia Plains',         description: "The fertile valley of the Eurotas river that fed and defined the Spartan state." },
            ],
          },
          {
            name: 'The Sacred Sites',
            description: "The pan-Hellenic sanctuaries that united all the Greek city-states.",
            cities: [
              { name: 'Delphi',                description: "The sanctuary of Apollo and seat of the Oracle, considered the navel of the world." },
              { name: 'Olympia',               description: "The sacred precinct where the Olympic Games were held every four years." },
              { name: "The Oracle's Temple",   description: "The inner sanctuary at Delphi where the Pythia delivered her cryptic prophecies." },
              { name: 'Mount Olympus',          description: "The highest mountain in Greece and mythological home of the twelve Olympian gods." },
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
