export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(code, message) {
    return new ApiError(400, code, message);
  }

  static unauthorized(code, message) {
    return new ApiError(401, code, message);
  }

  static forbidden(code, message) {
    return new ApiError(403, code, message);
  }

  static notFound(code, message) {
    return new ApiError(404, code, message);
  }

  static conflict(code, message) {
    return new ApiError(409, code, message);
  }

  static unprocessable(code, message) {
    return new ApiError(422, code, message);
  }

  static tooManyRequests(code, message) {
    return new ApiError(429, code, message);
  }

  static serviceUnavailable(code, message) {
    return new ApiError(503, code, message);
  }

  static internal(code, message) {
    return new ApiError(500, code, message);
  }
}
