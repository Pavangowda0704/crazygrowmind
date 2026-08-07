require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const employeePaymentRoutes = require('./routes/employeePaymentRoutes');
const publicRoutes = require('./routes/publicRoutes');

connectDB();

const app = express();

// Trust Render/any reverse proxy's X-Forwarded-* headers so req.protocol
// reports https correctly (used to build public share links).
app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin (e.g. curl, Postman, server-to-server) — allow.
      if (!origin) return callback(null, true);

      // In production, only ever allow the configured CLIENT_URL.
      if (process.env.NODE_ENV === 'production') {
        return origin === process.env.CLIENT_URL
          ? callback(null, true)
          : callback(new Error('Not allowed by CORS'));
      }

      // In development, allow the configured CLIENT_URL plus ANY
      // localhost/127.0.0.1 port — Vite auto-picks a new port (5174,
      // 5175, ...) whenever the previous one is busy, which would
      // otherwise break login every time with a CORS error.
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (origin === process.env.CLIENT_URL || isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serves locally-stored uploads (used automatically when Cloudinary env
// vars aren't configured — see middleware/upload.js) so logo, signature,
// and service images work out of the box for local development.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CrazyGrowMind Studio API is running', time: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-payments', employeePaymentRoutes);

// Public, unauthenticated routes — shared PDF links (invoices/bookings).
// No `protect` middleware; access is gated by an unguessable share token.
app.use('/api/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
