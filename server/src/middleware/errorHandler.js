export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal server error',
    status: err.status || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = {
      success: false,
      message: 'Validation failed',
      status: 400,
      errors
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      success: false,
      message: `${field} already exists`,
      status: 400
    };
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = {
      success: false,
      message: 'Invalid ID format',
      status: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      status: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      status: 401
    };
  }

  // Rate limiting error
  if (err.status === 429) {
    error = {
      success: false,
      message: 'Too many requests',
      status: 429,
      retryAfter: err.retryAfter
    };
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Internal server error';
  }

  res.status(error.status).json(error);
};