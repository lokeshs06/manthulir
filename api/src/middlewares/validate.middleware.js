import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

// schemas: { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
// Parsed (and coerced/defaulted) values are written back onto req, so
// downstream handlers see the validated shape, not the raw input.
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return sendError(res, {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      });
    }
    next(err);
  }
};
