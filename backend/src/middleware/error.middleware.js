// Error handling middleware for consistent error responses
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = { message, statusCode: 400 };
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map(val => val.message)
            .join(', ');
        error = { message, statusCode: 400 };
    }

    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Custom error class
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);