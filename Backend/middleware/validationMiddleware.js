/**
 * Email validation
 */
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Phone validation (basic)
 */
const validatePhone = (phone) => {
    const re = /^[0-9+\-\s()]{10,}$/;
    return re.test(phone);
};

/**
 * Password validation (minimum 6 chars, at least 1 letter and 1 number)
 */
const validatePassword = (password) => {
    return password && password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

/**
 * Validate required fields
 */
const validateRequiredFields = (data, fields) => {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
        return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    return { valid: true };
};

/**
 * Input sanitization (basic)
 */
const sanitizeInput = (data) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove potentially harmful characters
            sanitized[key] = value.trim().replace(/[<>\"']/g, '');
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Middleware to validate email
 */
const validateEmailMiddleware = (req, res, next) => {
    const { email } = req.body;
    if (email && !validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    next();
};

/**
 * Middleware to validate phone
 */
const validatePhoneMiddleware = (req, res, next) => {
    const { phone } = req.body;
    if (phone && !validatePhone(phone)) {
        return res.status(400).json({ error: 'Invalid phone format (at least 10 digits)' });
    }
    next();
};

/**
 * Input sanitization middleware
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeInput(req.body);
    }
    next();
};

module.exports = {
    validateEmail,
    validatePhone,
    validatePassword,
    validateRequiredFields,
    sanitizeInput,
    validateEmailMiddleware,
    validatePhoneMiddleware,
    sanitizeMiddleware
};
