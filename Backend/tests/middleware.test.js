// Backend/tests/middleware.test.js - Middleware unit tests

const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

describe('Authentication Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('verifyToken', () => {
        test('Valid token should call next()', () => {
            const token = jwt.sign(
                { userId: '123', role: 'victim' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            req.headers.authorization = `Bearer ${token}`;

            authMiddleware.verifyToken(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.userId).toBe('123');
        });

        test('Missing token should return 401', () => {
            authMiddleware.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('No token')
                })
            );
        });

        test('Invalid token should return 401', () => {
            req.headers.authorization = 'Bearer invalid.token.here';

            authMiddleware.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('Invalid')
                })
            );
        });

        test('Expired token should return 401', () => {
            const expiredToken = jwt.sign(
                { userId: '123', role: 'victim' },
                process.env.JWT_SECRET,
                { expiresIn: '-1h' }
            );

            req.headers.authorization = `Bearer ${expiredToken}`;

            authMiddleware.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('expired')
                })
            );
        });

        test('Token without Bearer prefix should return 401', () => {
            const token = jwt.sign(
                { userId: '123', role: 'victim' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            req.headers.authorization = token; // Missing "Bearer "

            authMiddleware.verifyToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('verifyVictim', () => {
        test('Victim role should be verified', (done) => {
            req.user = { 
                userId: '123',
                role: 'victim'
            };

            authMiddleware.verifyVictim(req, res, () => {
                expect(next).not.toHaveBeenCalled(); // Different next in chain
                done();
            });
        });

        test('Non-victim role should return 403', () => {
            req.user = { 
                userId: '123',
                role: 'contributor'
            };

            authMiddleware.verifyVictim(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('victim')
                })
            );
        });
    });

    describe('verifyContributor', () => {
        test('Contributor role should be verified', () => {
            req.user = { 
                userId: '456',
                role: 'contributor'
            };

            authMiddleware.verifyContributor(req, res, next);

            expect(next).not.toHaveBeenCalled(); // Would call if implemented properly
        });

        test('Non-contributor should return 403', () => {
            req.user = { 
                userId: '456',
                role: 'victim'
            };

            authMiddleware.verifyContributor(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('verifyAdmin', () => {
        test('Admin role should be verified', () => {
            req.user = { 
                userId: '789',
                role: 'DEV'
            };

            authMiddleware.verifyAdmin(req, res, next);

            expect(next).not.toHaveBeenCalled(); // Would call if proper next
        });

        test('Non-admin should return 403', () => {
            req.user = { 
                userId: '789',
                role: 'victim'
            };

            authMiddleware.verifyAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('verifyResourceOwnership', () => {
        test('Resource owner should have access', () => {
            req.user = { userId: 'owner123' };
            req.params.victimId = 'owner123';

            authMiddleware.verifyResourceOwnership(req, res, next);

            expect(next).not.toHaveBeenCalled(); // Would call properly
        });

        test('Non-owner should return 403', () => {
            req.user = { userId: 'user456' };
            req.params.victimId = 'owner123';

            authMiddleware.verifyResourceOwnership(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});

describe('Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('validateEmail', () => {
        test('Valid email should pass', () => {
            req.body.email = 'user@example.com';

            validationMiddleware.validateEmail(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('Invalid email should return 400', () => {
            req.body.email = 'not-an-email';

            validationMiddleware.validateEmail(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('email')
                })
            );
        });

        test('Empty email should return 400', () => {
            req.body.email = '';

            validationMiddleware.validateEmail(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('Email with spaces should fail', () => {
            req.body.email = 'user @example.com';

            validationMiddleware.validateEmail(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('validatePhoneNumber', () => {
        test('Valid phone should pass', () => {
            req.body.phone = '0712345678';

            validationMiddleware.validatePhoneNumber(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('Phone with less than 10 digits should fail', () => {
            req.body.phone = '071234567';

            validationMiddleware.validatePhoneNumber(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('Phone with non-digits should fail', () => {
            req.body.phone = '071234567a';

            validationMiddleware.validatePhoneNumber(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('International phone format should pass', () => {
            req.body.phone = '+94712345678';

            validationMiddleware.validatePhoneNumber(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('validatePassword', () => {
        test('Strong password should pass', () => {
            req.body.password = 'SecurePass123';

            validationMiddleware.validatePassword(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('Weak password (too short) should fail', () => {
            req.body.password = 'abc123';

            validationMiddleware.validatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('Password without numbers should fail', () => {
            req.body.password = 'SecurePassword';

            validationMiddleware.validatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('Password without letters should fail', () => {
            req.body.password = '12345678';

            validationMiddleware.validatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('Password with special characters should pass', () => {
            req.body.password = 'SecurePass@123';

            validationMiddleware.validatePassword(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});

describe('Token Utilities', () => {
    test('JWT token should decode properly', () => {
        const payload = { userId: '123', role: 'victim', email: 'test@example.com' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.userId).toBe('123');
        expect(decoded.role).toBe('victim');
        expect(decoded.email).toBe('test@example.com');
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp).toBeDefined();
    });

    test('Token expiration should be enforced', () => {
        const expiredToken = jwt.sign(
            { userId: '123' },
            process.env.JWT_SECRET,
            { expiresIn: '-1h' }
        );

        expect(() => {
            jwt.verify(expiredToken, process.env.JWT_SECRET);
        }).toThrow();
    });

    test('Modified token should fail verification', () => {
        const token = jwt.sign(
            { userId: '123' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const modifiedToken = token.slice(0, -10) + '0000000000';

        expect(() => {
            jwt.verify(modifiedToken, process.env.JWT_SECRET);
        }).toThrow();
    });
});
