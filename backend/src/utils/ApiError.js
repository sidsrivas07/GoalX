/**
 * ApiError — Custom error class for consistent error responses.
 * Extends the native Error class with an HTTP status code.
 *
 * Usage:
 *   throw new ApiError(404, 'Resource not found');
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
  }
}

export default ApiError;
