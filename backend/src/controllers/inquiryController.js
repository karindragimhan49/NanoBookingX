const { query } = require('../config/db');

const priorityWeight = { normal: 1, high: 2, urgent: 3 };

const formatInquiry = (i) => ({
  id: i.id,
  senderName: i.sender_name,
  senderEmail: i.sender_email,
  customerId: i.customer_id,
  subject: i.subject,
  message: i.message,
  packageId: i.package_id,
  packageName: i.package_name || null,
  status: i.status,
  priority: i.priority,
  respondedBy: i.responded_by,
  responseMessage: i.response_message,
  createdAt: i.created_at,
});

exports.createInquiry = async (req, res) => {
  try {
    const { senderName, senderEmail, subject, message, packageId, priority = 'normal' } = req.body;
    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required' });
    }
    const pw = priorityWeight[priority] || 1;
    const customerId = req.user ? req.user.id : null;
    const result = await query(`
      INSERT INTO inquiries (sender_name, sender_email, customer_id, subject, message, package_id, priority, priority_weight)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [senderName, senderEmail, customerId, subject, message, packageId || null, priority, pw]);
    res.status(201).json({ success: true, inquiry: formatInquiry(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, p.name as package_name FROM inquiries i
      LEFT JOIN packages p ON i.package_id = p.id
      WHERE i.customer_id = $1 ORDER BY i.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, inquiries: result.rows.map(formatInquiry) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const conditions = [];
    const values = [];
    let i = 1;
    if (status) { conditions.push(`i.status = $${i++}`); values.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(`
      SELECT i.*, p.name as package_name FROM inquiries i
      LEFT JOIN packages p ON i.package_id = p.id
      ${where}
      ORDER BY i.priority_weight DESC, i.created_at DESC
    `, values);
    res.json({ success: true, inquiries: result.rows.map(formatInquiry) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;
    const fields = [];
    const values = [];
    let i = 1;
    if (status) { fields.push(`status = $${i++}`); values.push(status); }
    if (responseMessage) {
      fields.push(`response_message = $${i++}`); values.push(responseMessage);
      fields.push(`responded_by = $${i++}`); values.push(req.user.id);
    }
    if (!fields.length) return res.status(400).json({ success: false, message: 'Nothing to update' });
    fields.push('updated_at = NOW()');
    values.push(id);
    const result = await query(
      `UPDATE inquiries SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, inquiry: formatInquiry(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM inquiries WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
