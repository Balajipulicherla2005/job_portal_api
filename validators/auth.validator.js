const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('jobseeker', 'employer').required().messages({
    'any.only': 'Role must be either jobseeker or employer',
    'any.required': 'Role is required'
  }),
  // Accept either name OR firstName/lastName
  name: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phone: Joi.string().optional(),
  // Employer fields
  companyName: Joi.string().when('role', {
    is: 'employer',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  companyDescription: Joi.string().optional(),
  website: Joi.string().optional(),
  // Job seeker fields
  skills: Joi.string().optional(),
  experience: Joi.string().optional(),
  education: Joi.string().optional()
}).unknown(true); // Allow additional fields

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
