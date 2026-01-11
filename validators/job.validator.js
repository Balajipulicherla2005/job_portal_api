const Joi = require('joi');

const createJobSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Job title is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Job description is required'
  }),
  qualifications: Joi.string().required().messages({
    'any.required': 'Qualifications are required'
  }),
  responsibilities: Joi.string().required().messages({
    'any.required': 'Responsibilities are required'
  }),
  location: Joi.string().required().messages({
    'any.required': 'Location is required'
  }),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').required().messages({
    'any.only': 'Job type must be one of: full-time, part-time, contract, freelance, internship',
    'any.required': 'Job type is required'
  }),
  salaryRange: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    currency: Joi.string().optional()
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  experience: Joi.string().optional(),
  deadline: Joi.date().optional()
});

const updateJobSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  qualifications: Joi.string().optional(),
  responsibilities: Joi.string().optional(),
  location: Joi.string().optional(),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').optional(),
  salaryRange: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    currency: Joi.string().optional()
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  experience: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  deadline: Joi.date().optional()
});

module.exports = {
  createJobSchema,
  updateJobSchema
};
