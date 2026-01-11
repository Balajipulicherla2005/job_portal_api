const Joi = require('joi');

const createJobSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Job title is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Job description is required'
  }),
  qualifications: Joi.string().allow('', null).optional(),
  responsibilities: Joi.string().allow('', null).optional(),
  location: Joi.string().required().messages({
    'any.required': 'Location is required'
  }),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'temporary').default('full-time'),
  salaryMin: Joi.number().min(0).optional().allow(null),
  salaryMax: Joi.number().min(0).optional().allow(null),
  salaryPeriod: Joi.string().valid('hourly', 'monthly', 'yearly').default('yearly'),
  experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional().allow('', null),
  skills: Joi.array().items(Joi.string()).optional(),
  benefits: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('active', 'closed', 'draft').optional(),
  applicationDeadline: Joi.date().optional().allow(null)
});

const updateJobSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  qualifications: Joi.string().allow('', null).optional(),
  responsibilities: Joi.string().allow('', null).optional(),
  location: Joi.string().optional(),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'temporary').optional(),
  salaryMin: Joi.number().min(0).optional().allow(null),
  salaryMax: Joi.number().min(0).optional().allow(null),
  salaryPeriod: Joi.string().valid('hourly', 'monthly', 'yearly').optional(),
  experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional().allow('', null),
  skills: Joi.array().items(Joi.string()).optional(),
  benefits: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('active', 'closed', 'draft').optional(),
  applicationDeadline: Joi.date().optional().allow(null)
});

module.exports = {
  createJobSchema,
  updateJobSchema
};
