export const sendSuccess = (res, { statusCode = 200, data = null, meta } = {}) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const sendError = (res, { statusCode = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong' } = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};
