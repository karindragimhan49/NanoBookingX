require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
const initDb = require('./src/config/initDb');

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'GlobeTrek Adventures API is running', timestamp: new Date().toISOString() }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/packages', require('./src/routes/packageRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/inquiries', require('./src/routes/inquiryRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`GlobeTrek Adventures API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  }
})();
