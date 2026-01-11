const { validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/functions');

/**
 * Validate request using express-validator
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    return sendValidationError(res, formattedErrors);
  }
  
  next();
};

module.exports = exports;
