const Sentry = require('@sentry/node');

const errorMiddleware = (err, req, res, next) => {
  Sentry.captureException(err);

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(409).json({ message: 'Duplicate entry', errors });
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired.' });
  }

  // Joi Validation Error
  if (err.isJoi) {
    return res.status(400).json({ message: err.details[0].message });
  }

  // Generic Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
