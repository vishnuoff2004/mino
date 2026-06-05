const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
});

const serviceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().required(),
  duration: Joi.string().required(),
}).options({ allowUnknown: true });

const providerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  skill_type: Joi.string().required(),
  phoneno: Joi.string()
    .min(5)
    .max(25)
    .required()
    .messages({
      'string.min': 'Phone number must be at least 5 characters',
      'any.required': 'Phone number is required',
    }),
  availabilitystatus: Joi.string().valid('available', 'not_available').required(),
}).options({ allowUnknown: true });

const bookingSchema = Joi.object({
  serviceId: Joi.number().integer().positive().required(),
  providerId: Joi.number().integer().positive().required(),
  address: Joi.string().min(5).required(),
  bookingDate: Joi.date().required(),
}).options({ allowUnknown: true });

const updateBookingStatusSchema = Joi.object({
  bookingStatusId: Joi.number().integer().min(1).max(4).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifySchema,
  serviceSchema,
  providerSchema,
  bookingSchema,
  updateBookingStatusSchema,
};
