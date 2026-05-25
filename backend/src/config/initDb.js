const { query } = require('./db');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  // Drop and recreate for clean schema
  await query(`DROP TABLE IF EXISTS reviews, bookings, inquiries, packages, travel_packages, users CASCADE`);

  await query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      phone VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE packages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      destination_country VARCHAR(255) DEFAULT 'Sri Lanka',
      destination_city VARCHAR(255),
      description TEXT,
      short_description VARCHAR(500),
      activities TEXT[],
      category VARCHAR(100),
      difficulty VARCHAR(50) DEFAULT 'moderate',
      duration_days INTEGER,
      duration_nights INTEGER,
      price_per_person DECIMAL(10,2),
      discounted_price DECIMAL(10,2),
      max_group_size INTEGER DEFAULT 15,
      current_bookings_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      is_featured BOOLEAN DEFAULT FALSE,
      image_url TEXT,
      gallery_urls TEXT[],
      includes TEXT[],
      excludes TEXT[],
      itinerary JSONB,
      average_rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE bookings (
      id SERIAL PRIMARY KEY,
      package_id INTEGER REFERENCES packages(id),
      customer_id INTEGER REFERENCES users(id),
      travel_start_date DATE NOT NULL,
      number_of_travellers INTEGER NOT NULL,
      price_per_person_at_booking DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      special_requirements TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      payment_status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE inquiries (
      id SERIAL PRIMARY KEY,
      sender_name VARCHAR(255) NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      customer_id INTEGER REFERENCES users(id),
      subject VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      package_id INTEGER REFERENCES packages(id),
      status VARCHAR(50) DEFAULT 'new',
      priority VARCHAR(50) DEFAULT 'normal',
      priority_weight INTEGER DEFAULT 1,
      responded_by INTEGER REFERENCES users(id),
      response_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      package_id INTEGER REFERENCES packages(id),
      customer_id INTEGER REFERENCES users(id),
      booking_id INTEGER REFERENCES bookings(id),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      is_visible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('Database tables created successfully');
};

const seedData = async () => {
  const adminPass = await bcrypt.hash('admin@123', 12);
  const staffPass = await bcrypt.hash('staff@123', 12);
  const customerPass = await bcrypt.hash('customer@123', 12);

  await query(
    `INSERT INTO users (full_name, email, password, role) VALUES ($1,$2,$3,$4),($5,$6,$7,$8),($9,$10,$11,$12)`,
    ['System Admin', 'admin@globetrek.lk', adminPass, 'admin',
     'Sarah Fernando', 'staff@globetrek.lk', staffPass, 'staff',
     'Nimal Perera', 'customer@globetrek.lk', customerPass, 'customer']
  );

  const packages = [
    {
      name: 'Sigiriya Rock & Cultural Heritage Tour',
      slug: 'sigiriya-rock-cultural-heritage',
      city: 'Sigiriya & Polonnaruwa',
      desc: 'Explore the iconic Sigiriya Rock Fortress, a UNESCO World Heritage Site, along with the ancient city of Polonnaruwa. Expert guides bring the stories of ancient kingdoms to life across five remarkable days.',
      short: 'Discover ancient kingdoms with a guided tour of Sigiriya Rock Fortress and Polonnaruwa.',
      activities: ['Rock climbing', 'Historical site visits', 'Guided heritage walks', 'Photography sessions'],
      category: 'cultural', difficulty: 'moderate', days: 5, nights: 4, price: 450.00, discounted: 395.00, group: 12, featured: true,
      image: 'https://images.unsplash.com/photo-1580181591617-79e8b65c94e1?auto=format&fit=crop&w=1200&q=80',
      includes: ['Accommodation (4 nights)', 'Daily breakfast & dinner', 'English-speaking guide', 'Entrance fees', 'Air-conditioned transport'],
      excludes: ['International flights', 'Travel insurance', 'Personal expenses', 'Lunch'],
      itinerary: [
        { day: 1, title: 'Arrival & Dambulla Cave Temple', description: 'Arrive in Colombo, transfer to Dambulla. Visit the magnificent Cave Temple complex.' },
        { day: 2, title: 'Sigiriya Rock Fortress', description: 'Full day at the iconic Sigiriya Rock Fortress. Climb to the summit for breathtaking views.' },
        { day: 3, title: 'Polonnaruwa Ancient City', description: 'Explore the well-preserved ruins of Polonnaruwa, the medieval capital of Sri Lanka.' },
        { day: 4, title: 'Village Experience', description: 'Authentic village bullock cart ride, cooking demonstration, and nature walk.' },
        { day: 5, title: 'Return to Colombo', description: 'Morning at leisure, transfer to Colombo for departure.' }
      ]
    },
    {
      name: 'Whale Watching & Southern Coast Adventure',
      slug: 'whale-watching-southern-coast',
      city: 'Mirissa & Unawatuna',
      desc: 'Experience the thrill of whale watching in Mirissa Bay, one of the best whale watching spots in the world. Blue whales and sperm whales are commonly sighted. Combine this with relaxation on the pristine beaches of Unawatuna and a stroll through historic Galle Fort.',
      short: 'Watch blue whales in the wild and relax on stunning southern coast beaches.',
      activities: ['Whale watching boat tour', 'Snorkeling', 'Beach relaxation', 'Galle Fort exploration'],
      category: 'adventure', difficulty: 'easy', days: 4, nights: 3, price: 520.00, discounted: null, group: 16, featured: true,
      image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=80',
      includes: ['Beachfront accommodation (3 nights)', 'Daily breakfast', 'Whale watching tour', 'Snorkeling equipment', 'Transport'],
      excludes: ['International flights', 'Travel insurance', 'Lunch & dinner', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrival in Mirissa', description: 'Arrive at Mirissa beach resort. Evening at leisure on the beach.' },
        { day: 2, title: 'Whale Watching Expedition', description: 'Early morning whale watching boat tour. Afternoon beach time and snorkeling.' },
        { day: 3, title: 'Galle Fort & Unawatuna', description: 'Morning visit to UNESCO-listed Galle Fort. Afternoon at Unawatuna beach.' },
        { day: 4, title: 'Departure', description: 'Breakfast, check-out, and transfer to Colombo airport.' }
      ]
    },
    {
      name: 'Yala National Park Safari Experience',
      slug: 'yala-national-park-safari',
      city: 'Yala & Tissamaharama',
      desc: 'Embark on an unforgettable wildlife safari in Yala National Park, home to the world highest density of leopards. Also encounter elephants, sloth bears, crocodiles, and hundreds of bird species in a luxury tented camp.',
      short: 'Spot leopards, elephants, and exotic wildlife in Sri Lanka premier national park.',
      activities: ['Morning & evening game drives', 'Bird watching', 'Nature photography', 'Cultural village visit'],
      category: 'wildlife', difficulty: 'easy', days: 3, nights: 2, price: 680.00, discounted: 595.00, group: 8, featured: true,
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1200&q=80',
      includes: ['Tented camp accommodation (2 nights)', 'All meals', 'Safari jeep (private)', 'Expert naturalist guide', 'Park entrance fees'],
      excludes: ['International flights', 'Travel insurance', 'Alcoholic beverages', 'Tips'],
      itinerary: [
        { day: 1, title: 'Arrival at Yala', description: 'Arrive at tented camp. Afternoon game drive in Yala Block 1.' },
        { day: 2, title: 'Full Safari Day', description: 'Early morning and late afternoon game drives. Rest and lunch at camp.' },
        { day: 3, title: 'Morning Drive & Departure', description: 'Final morning safari drive, breakfast, departure to Colombo.' }
      ]
    },
    {
      name: 'Kandy & Hill Country Tea Plantation Tour',
      slug: 'kandy-hill-country-tea-plantation',
      city: 'Kandy, Nuwara Eliya & Ella',
      desc: 'Journey through Sri Lanka breathtaking hill country on the world-famous Kandy to Ella train journey. Visit the Temple of the Tooth Relic, explore lush tea plantations in Nuwara Eliya, hike to Ella Rock, and experience misty mountain magic.',
      short: 'Take the legendary train through misty mountains, visit tea estates, and explore Kandy sacred temples.',
      activities: ['Scenic train journey', 'Tea estate tour & tasting', 'Temple of Tooth Relic visit', 'Ella Rock hike', 'Cooking class'],
      category: 'cultural', difficulty: 'moderate', days: 6, nights: 5, price: 620.00, discounted: 540.00, group: 14, featured: false,
      image: 'https://images.unsplash.com/photo-1571406384609-2b9f83ccf4b6?auto=format&fit=crop&w=1200&q=80',
      includes: ['Accommodation (5 nights)', 'Daily breakfast', 'Train tickets (1st class)', 'Guide', 'Tea estate tour'],
      excludes: ['International flights', 'Travel insurance', 'Dinners', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Kandy Arrival', description: 'Arrive in Kandy. Evening Kandyan cultural dance show.' },
        { day: 2, title: 'Kandy Sightseeing', description: 'Temple of the Tooth Relic, Botanical Gardens, Kandy Lake.' },
        { day: 3, title: 'Train to Nuwara Eliya', description: 'Scenic train journey through the mountains. Tea estate visit.' },
        { day: 4, title: 'Nuwara Eliya', description: 'Gregory Lake, Victoria Park, local market, tea tasting.' },
        { day: 5, title: 'Ella', description: 'Train to Ella. Nine Arch Bridge, Ella Rock hike.' },
        { day: 6, title: 'Departure', description: 'Morning at leisure, transfer to Colombo.' }
      ]
    },
    {
      name: 'Galle Fort & Lagoon Luxury Escape',
      slug: 'galle-fort-lagoon-luxury',
      city: 'Galle & Bentota',
      desc: 'Experience the perfect blend of history and luxury on Sri Lanka beautiful southwest coast. Explore the Dutch-built Galle Fort, relax on golden beaches, enjoy water sports on the Bentota Lagoon, and stay in boutique heritage hotels.',
      short: 'Explore the UNESCO-listed Galle Fort and unwind on golden southwest coast beaches.',
      activities: ['Galle Fort guided tour', 'Lagoon boat ride', 'Water sports', 'Turtle watching', 'Spa treatments'],
      category: 'luxury', difficulty: 'easy', days: 4, nights: 3, price: 780.00, discounted: null, group: 10, featured: true,
      image: 'https://images.unsplash.com/photo-1576011853-e7d44d64fa14?auto=format&fit=crop&w=1200&q=80',
      includes: ['Boutique hotel (3 nights)', 'Breakfast & dinner daily', 'Private guide', 'Lagoon boat ride', 'One spa session'],
      excludes: ['International flights', 'Travel insurance', 'Lunches', 'Water sports equipment rental'],
      itinerary: [
        { day: 1, title: 'Bentota Arrival', description: 'Arrive at Bentota luxury resort. Evening river cruise.' },
        { day: 2, title: 'Galle Fort Day Trip', description: 'Full day at UNESCO-listed Galle Fort. Museums, ramparts, and boutique shopping.' },
        { day: 3, title: 'Beach & Water Sports', description: 'Lagoon water sports, turtle hatchery visit, afternoon spa.' },
        { day: 4, title: 'Departure', description: 'Breakfast, beachside farewell, transfer to Colombo.' }
      ]
    },
    {
      name: "Adam's Peak Pilgrimage Trek",
      slug: 'adams-peak-pilgrimage-trek',
      city: 'Dalhousie & Nallathanniya',
      desc: "Undertake the legendary overnight trek to the summit of Adam's Peak (Sri Pada), one of Sri Lanka most sacred mountains. Watch the magical sunrise from the summit and see the famous shadow of the peak cast across misty valleys below.",
      short: "Trek overnight to Sri Lanka most sacred summit and witness an unforgettable mountain sunrise.",
      activities: ['Night trek (5-7 hours)', 'Sunrise viewing at summit', 'Buddhist shrine visit', 'Waterfall stop'],
      category: 'adventure', difficulty: 'challenging', days: 2, nights: 1, price: 280.00, discounted: 245.00, group: 20, featured: false,
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      includes: ['Guesthouse accommodation', 'Dinner & breakfast', 'Experienced trek guide', 'Head torch rental', 'Transport from Colombo'],
      excludes: ['International flights', 'Travel insurance', 'Personal trekking gear', 'Tips'],
      itinerary: [
        { day: 1, title: 'Transfer & Evening Preparation', description: 'Travel from Colombo to Dalhousie. Dinner and rest before the midnight trek.' },
        { day: 2, title: 'Summit Trek & Sunrise', description: 'Midnight start, 4-6 hour ascent, sunrise at summit, descent and breakfast, return to Colombo.' }
      ]
    }
  ];

  for (const pkg of packages) {
    await query(
      `INSERT INTO packages (name, slug, destination_city, description, short_description, activities,
       category, difficulty, duration_days, duration_nights, price_per_person, discounted_price,
       max_group_size, is_featured, image_url, includes, excludes, itinerary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [pkg.name, pkg.slug, pkg.city, pkg.desc, pkg.short, pkg.activities,
       pkg.category, pkg.difficulty, pkg.days, pkg.nights, pkg.price, pkg.discounted,
       pkg.group, pkg.featured, pkg.image, pkg.includes, pkg.excludes, JSON.stringify(pkg.itinerary)]
    );
  }

  console.log('Seed data inserted: 3 users, 6 packages');
};

const initDb = async () => {
  await createTables();
  await seedData();
};

module.exports = initDb;
