import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res) => {
  sendError(res, { statusCode: 404, code: 'NOT_FOUND', message: 'Route not found' });
};

export const errorHandler = (err, req, res, next) => {
  const origin = req.headers?.origin;
  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (err instanceof ApiError) {
    return sendError(res, { statusCode: err.statusCode, code: err.code, message: err.message });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, { statusCode: 400, code: 'FILE_TOO_LARGE', message: 'File size must be 5MB or smaller' });
    }
    return sendError(res, { statusCode: 400, code: 'UPLOAD_ERROR', message: err.message });
  }

  if (err.message && (err.message.toLowerCase().includes('boundary') || err.message.toLowerCase().includes('multipart'))) {
    return sendError(res, { statusCode: 400, code: 'INVALID_MULTIPART', message: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return sendError(res, { statusCode: 400, code: 'VALIDATION_ERROR', message: err.message });
  }

  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, { statusCode: 400, code: 'INVALID_ID', message: `Invalid ${err.path}` });
  }

  if (err.code === 11000) {
    return sendError(res, { statusCode: 409, code: 'DUPLICATE_KEY', message: 'A record with this value already exists' });
  }

  if (!env.isTest) {
    logger.error({ err }, err.message || 'Unhandled error');
  }

  return sendError(res, { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong' });
};
