/**
 * Global Error Handler Middleware
 *
 * Catches all errors thrown or forwarded via next(err).
 * Returns a clean, consistent JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`\n❌ [ERROR] ${statusCode} — ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
