const { query, getClient } = require('../config/db');

const formatBooking = (b) => ({
  id: b.id,
  package: b.package_name ? {
    id: b.package_id,
    name: b.package_name,
    slug: b.package_slug,
    imageUrl: b.package_image,
    destinationCity: b.destination_city,
    durationDays: b.duration_days,
  } : null,
  customer: b.customer_name ? {
    id: b.customer_id,
    fullName: b.customer_name,
    email: b.customer_email,
  } : null,
  travelStartDate: b.travel_start_date,
  numberOfTravellers: b.number_of_travellers,
  pricePerPersonAtBooking: parseFloat(b.price_per_person_at_booking),
  totalPrice: parseFloat(b.total_price),
  specialRequirements: b.special_requirements,
  status: b.status,
  paymentStatus: b.payment_status,
  createdAt: b.created_at,
});

exports.createBooking = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { travelPackageId, travelStartDate, numberOfTravelers, specialRequirements } = req.body;
    if (!travelPackageId || !travelStartDate || !numberOfTravelers) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Package, date, and number of travelers are required' });
    }
    const pkgRes = await client.query(
      'SELECT id, price_per_person, discounted_price, max_group_size, current_bookings_count, is_active FROM packages WHERE id = $1 FOR UPDATE',
      [travelPackageId]
    );
    if (!pkgRes.rows.length || !pkgRes.rows[0].is_active) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Package not found or inactive' });
    }
    const pkg = pkgRes.rows[0];
    const available = pkg.max_group_size - pkg.current_bookings_count;
    if (numberOfTravelers > available) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Only ${available} seats available` });
    }
    const pricePerPerson = parseFloat(pkg.discounted_price || pkg.price_per_person);
    const totalPrice = pricePerPerson * numberOfTravelers;
    const bookingRes = await client.query(`
      INSERT INTO bookings (package_id, customer_id, travel_start_date, number_of_travellers, price_per_person_at_booking, total_price, special_requirements)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [travelPackageId, req.user.id, travelStartDate, numberOfTravelers, pricePerPerson, totalPrice, specialRequirements || null]);
    await client.query('UPDATE packages SET current_bookings_count = current_bookings_count + $1 WHERE id = $2', [numberOfTravelers, travelPackageId]);
    await client.query('COMMIT');
    res.status(201).json({ success: true, booking: formatBooking(bookingRes.rows[0]) });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*, p.name as package_name, p.slug as package_slug, p.image_url as package_image,
             p.destination_city, p.duration_days
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, bookings: result.rows.map(formatBooking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const values = [];
    let i = 1;
    if (status) { conditions.push(`b.status = $${i++}`); values.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    values.push(parseInt(limit), offset);
    const result = await query(`
      SELECT b.*, p.name as package_name, p.slug as package_slug, p.image_url as package_image,
             p.destination_city, p.duration_days,
             u.full_name as customer_name, u.email as customer_email
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.id
      LEFT JOIN users u ON b.customer_id = u.id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT $${i++} OFFSET $${i}
    `, values);
    res.json({ success: true, bookings: result.rows.map(formatBooking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: formatBooking(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const bookingRes = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 FOR UPDATE',
      [id, req.user.id]
    );
    if (!bookingRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const booking = bookingRes.rows[0];
    if (['cancelled', 'completed'].includes(booking.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }
    await client.query('UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2', ['cancelled', id]);
    await client.query('UPDATE packages SET current_bookings_count = GREATEST(current_bookings_count - $1, 0) WHERE id = $2', [booking.number_of_travellers, booking.package_id]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};
