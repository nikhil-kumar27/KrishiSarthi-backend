/**
 * error-handler.js
 *
 * Single Responsibility: Centralized error handling.
 *
 * Exposes:
 *   - AppError: a typed error class carrying an HTTP status code
 *   - notFoundHandler: 404 handler for unmatched routes
 *   - errorHandler: Express error-handling middleware (4 args)
 *
 * Every thrown error in the app should ideally be an AppError so the
 * correct HTTP status code is used. Unexpected errors still fall back
 * to a safe 500 response.
 */

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, AppError);
  }
}

function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
    },
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error-handler]', err);
  }

  const responseBody = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  if (err instanceof AppError && err.details) {
    responseBody.error.details = err.details;
  }

  res.status(statusCode).json(responseBody);
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
