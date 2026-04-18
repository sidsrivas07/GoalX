/**
 * ApiResponse — Standardized success response wrapper.
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, data, 'Success'));
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
