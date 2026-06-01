const jwt = require('jsonwebtoken');

/**
 * Verify JWT Token and attach user info to request
 * Usage: router.get('/protected-route', verifyToken, handler)
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Verify user is a Victim
 */
const verifyVictim = (req, res, next) => {
    if (req.user?.role !== 'victim') {
        return res.status(403).json({ error: 'Only victims can access this' });
    }
    next();
};

/**
 * Verify user is a Contributor
 */
const verifyContributor = (req, res, next) => {
    if (req.user?.role !== 'contributor') {
        return res.status(403).json({ error: 'Only contributors can access this' });
    }
    next();
};

/**
 * Verify user is an Admin
 */
const verifyAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can access this' });
    }
    next();
};

/**
 * Verify user is a Supplier
 */
const verifySupplier = (req, res, next) => {
    if (req.user?.role !== 'supplier') {
        return res.status(403).json({ error: 'Only suppliers can access this' });
    }
    next();
};

/**
 * Verify resource ownership (for profile updates, etc.)
 * Usage: router.put('/profile/:victimId', verifyToken, verifyVictim, verifyResourceOwnership, handler)
 */
const verifyResourceOwnership = (paramName = 'id') => {
    return (req, res, next) => {
        const resourceId = req.params[paramName];
        const userIdField = req.user?.victimId || req.user?.contributorId || req.user?.id;
        
        if (resourceId !== userIdField) {
            return res.status(403).json({ error: 'You can only access your own resources' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    verifyVictim,
    verifyContributor,
    verifyAdmin,
    verifySupplier,
    verifyResourceOwnership
};
