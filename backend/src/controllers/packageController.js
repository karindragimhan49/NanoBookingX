const { query } = require('../config/db');

const packageFields = `
  p.id, p.name, p.slug, p.destination_country, p.destination_city,
  p.description, p.short_description, p.activities, p.category, p.difficulty,
  p.duration_days, p.duration_nights, p.price_per_person, p.discounted_price,
  p.max_group_size, p.current_bookings_count, p.is_active, p.is_featured,
  p.image_url, p.gallery_urls, p.includes, p.excludes, p.itinerary,
  p.average_rating, p.review_count, p.created_at
`;

const formatPackage = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  destination: { country: p.destination_country, city: p.destination_city },
  description: p.description,
  shortDescription: p.short_description,
  activities: p.activities || [],
  category: p.category,
  difficulty: p.difficulty,
  durationDays: p.duration_days,
  durationNights: p.duration_nights,
  pricePerPerson: parseFloat(p.price_per_person),
  discountedPrice: p.discounted_price ? parseFloat(p.discounted_price) : null,
  effectivePrice: p.discounted_price ? parseFloat(p.discounted_price) : parseFloat(p.price_per_person),
  maxGroupSize: p.max_group_size,
  currentBookingsCount: p.current_bookings_count,
  availableSeats: p.max_group_size - p.current_bookings_count,
  isActive: p.is_active,
  isFeatured: p.is_featured,
  imageUrl: p.image_url,
  galleryUrls: p.gallery_urls || [],
  includes: p.includes || [],
  excludes: p.excludes || [],
  itinerary: p.itinerary || [],
  averageRating: parseFloat(p.average_rating) || 0,
  reviewCount: p.review_count,
  createdAt: p.created_at,
});

exports.getAllPackages = async (req, res) => {
  try {
    const { search, category, difficulty, minPrice, maxPrice, featured } = req.query;
    const conditions = ['p.is_active = TRUE'];
    const values = [];
    let i = 1;
    if (search) { conditions.push(`(p.name ILIKE $${i} OR p.destination_city ILIKE $${i})`); values.push(`%${search}%`); i++; }
    if (category) { conditions.push(`p.category = $${i++}`); values.push(category); }
    if (difficulty) { conditions.push(`p.difficulty = $${i++}`); values.push(difficulty); }
    if (minPrice) { conditions.push(`p.price_per_person >= $${i++}`); values.push(parseFloat(minPrice)); }
    if (maxPrice) { conditions.push(`p.price_per_person <= $${i++}`); values.push(parseFloat(maxPrice)); }
    if (featured === 'true') { conditions.push('p.is_featured = TRUE'); }
    const sql = `SELECT ${packageFields} FROM packages p WHERE ${conditions.join(' AND ')} ORDER BY p.is_featured DESC, p.created_at DESC`;
    const result = await query(sql, values);
    res.json({ success: true, packages: result.rows.map(formatPackage), totalCount: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const isSlug = isNaN(parseInt(id));
    const sql = `SELECT ${packageFields} FROM packages p WHERE ${isSlug ? 'p.slug = $1' : 'p.id = $1'} AND p.is_active = TRUE`;
    const result = await query(sql, [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, package: formatPackage(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const {
      name, slug, destinationCountry, destinationCity, description, shortDescription,
      activities, category, difficulty, durationDays, durationNights,
      pricePerPerson, discountedPrice, maxGroupSize, isFeatured, imageUrl, galleryUrls,
      includes, excludes, itinerary
    } = req.body;
    if (!name || !pricePerPerson || !durationDays) {
      return res.status(400).json({ success: false, message: 'Name, price, and duration are required' });
    }
    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const result = await query(`
      INSERT INTO packages (
        name, slug, destination_country, destination_city, description, short_description,
        activities, category, difficulty, duration_days, duration_nights,
        price_per_person, discounted_price, max_group_size, is_featured, image_url,
        gallery_urls, includes, excludes, itinerary
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *
    `, [
      name, autoSlug, destinationCountry || 'Sri Lanka', destinationCity, description, shortDescription,
      activities, category, difficulty, durationDays, durationNights,
      pricePerPerson, discountedPrice || null, maxGroupSize || 15, isFeatured || false, imageUrl,
      galleryUrls, includes, excludes, itinerary ? JSON.stringify(itinerary) : null
    ]);
    res.status(201).json({ success: true, package: formatPackage(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let i = 1;
    const allowed = ['name', 'description', 'short_description', 'destination_city', 'category', 'difficulty',
      'duration_days', 'duration_nights', 'price_per_person', 'discounted_price', 'max_group_size',
      'is_featured', 'is_active', 'image_url', 'activities', 'includes', 'excludes', 'itinerary'];
    const map = {
      name: 'name', description: 'description', shortDescription: 'short_description',
      destinationCity: 'destination_city', category: 'category', difficulty: 'difficulty',
      durationDays: 'duration_days', durationNights: 'duration_nights',
      pricePerPerson: 'price_per_person', discountedPrice: 'discounted_price',
      maxGroupSize: 'max_group_size', isFeatured: 'is_featured', isActive: 'is_active',
      imageUrl: 'image_url', activities: 'activities', includes: 'includes',
      excludes: 'excludes', itinerary: 'itinerary'
    };
    for (const [key, col] of Object.entries(map)) {
      if (req.body[key] !== undefined) {
        let val = req.body[key];
        if (key === 'itinerary') val = JSON.stringify(val);
        fields.push(`${col} = $${i++}`);
        values.push(val);
      }
    }
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await query(
      `UPDATE packages SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, package: formatPackage(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE packages SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
