/**
 * Not Found Middleware
 *
 * Catches any request that doesn't match a defined route
 * and forwards a 404 error to the global error handler.
 */
import ApiError from '../utils/ApiError.js';

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
