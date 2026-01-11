const { RESPONSE_STATUS, HTTP_STATUS } = require('../config/constants');

/**
 * Send standardized response
 */
const sendResponse = (res, status, statusCode, data = {}, error = null) => {
  const response = {
    status,
    data,
    error: error || null,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

/**
 * Send success response
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return sendResponse(res, RESPONSE_STATUS.SUCCESS, statusCode, {
    ...data,
    message
  });
};

/**
 * Send error response
 */
const sendError = (res, message = 'Error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) => {
  return sendResponse(res, RESPONSE_STATUS.ERROR, statusCode, {}, {
    message,
    details
  });
};

/**
 * Send validation error response
 */
const sendValidationError = (res, errors) => {
  return sendResponse(res, RESPONSE_STATUS.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, {}, {
    message: 'Validation failed',
    errors
  });
};

/**
 * Pagination helper
 */
const paginate = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  
  const skip = (pageNum - 1) * limitNum;
  
  return {
    skip,
    limit: limitNum,
    page: pageNum
  };
};

/**
 * Build pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Generate unique filename
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendValidationError,
  paginate,
  buildPaginationMeta,
  generateUniqueFilename,
  isValidObjectId
};
