/**
 * Error Response Utility Middleware
 * Standardizes error responses across the entire API
 * Usage: app.use(errorResponseMiddleware);
 */

// Standard error response format
const errorResponse = (status, message, details = null) => {
    return {
        error: message,
        status,
        ...(details && { details })
    };
};

// Error response middleware
const errorResponseMiddleware = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json(errorResponse(400, 'Validation error', Object.values(err.errors).map(e => e.message)));
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json(errorResponse(400, `${field} already exists`));
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(errorResponse(401, 'Invalid token'));
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(errorResponse(401, 'Token expired'));
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        return res.status(400).json(errorResponse(400, 'Invalid ID format'));
    }

    // Default server error
    return res.status(500).json(errorResponse(500, 'Internal server error', process.env.NODE_ENV === 'development' ? err.message : undefined));
};

// Helper function for route handlers to standardize responses
const sendError = (res, status, message, details = null) => {
    res.status(status).json(errorResponse(status, message, details));
};

const sendSuccess = (res, data, message = 'Success', status = 200) => {
    res.status(status).json({
        success: true,
        message,
        data,
        status
    });
};

// Common HTTP status error helpers
const errors = {
    badRequest: (message = 'Bad request') => ({ status: 400, message }),
    unauthorized: (message = 'Unauthorized') => ({ status: 401, message }),
    forbidden: (message = 'Forbidden') => ({ status: 403, message }),
    notFound: (message = 'Not found') => ({ status: 404, message }),
    conflict: (message = 'Conflict') => ({ status: 409, message }),
    validationError: (message = 'Validation error') => ({ status: 422, message }),
    serverError: (message = 'Internal server error') => ({ status: 500, message })
};

module.exports = {
    errorResponseMiddleware,
    errorResponse,
    sendError,
    sendSuccess,
    errors
};
