require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const { sequelize } = require('./models');
const errorMiddleware = require('./middleware/errorMiddleware');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  integrations: [Sentry.expressIntegration()],
});

// Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const providerRoutes = require('./routes/providers');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173',"http://localhost:5174", 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the BookEase API!" });
});

app.get('/api/test-sentry', () => { throw new Error('Sentry works!') });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Sentry error handler (must come before the generic error middleware)
Sentry.setupExpressErrorHandler(app);

// Error handler
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}


module.exports = app;
