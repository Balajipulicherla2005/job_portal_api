module.exports = {
  // User Roles
  USER_ROLES: {
    JOB_SEEKER: 'job_seeker',
    EMPLOYER: 'employer',
    ADMIN: 'admin'
  },

  // Job Types
  JOB_TYPES: {
    FULL_TIME: 'full_time',
    PART_TIME: 'part_time',
    CONTRACT: 'contract',
    INTERNSHIP: 'internship',
    FREELANCE: 'freelance'
  },

  // Job Status
  JOB_STATUS: {
    ACTIVE: 'active',
    CLOSED: 'closed',
    DRAFT: 'draft'
  },

  // Application Status
  APPLICATION_STATUS: {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    SHORTLISTED: 'shortlisted',
    REJECTED: 'rejected',
    ACCEPTED: 'accepted'
  },

  // Experience Levels
  EXPERIENCE_LEVELS: {
    ENTRY: 'entry',
    INTERMEDIATE: 'intermediate',
    SENIOR: 'senior',
    EXPERT: 'expert'
  },

  // Response Status
  RESPONSE_STATUS: {
    SUCCESS: 1,
    ERROR: 0,
    VALIDATION_ERROR: 2
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  }
};
