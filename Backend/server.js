// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { sanitizeMiddleware } = require('./middleware/validationMiddleware');

const app = express();

// Ensure we have the DB URL early
if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI in environment variables (.env).');
    process.exit(1);
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS Configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    'http://localhost',
    'https://resqlink-1-dt40.onrender.com',
    'https://resqlink-ovm6.onrender.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Development: Allow all localhost origins
        if (isDevelopment) {
            if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
            } else {
                callback(null, true); // Allow in dev for testing
            }
        } else {
            // Production: Only allow whitelisted origins
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true
}));

// Input sanitization middleware
app.use(sanitizeMiddleware); 
// const allowedOrigins = [process.env.CLIENT_URL, process.env.SIGNUP_URL].filter(Boolean);
// app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/general', require('./routes/homeRoutes'));
app.use('/api/map', require('./routes/mapRoutes'));
app.use('/api/needs', require('./routes/needsRoutes'));
app.use('/api/contributor', require('./routes/contributorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});