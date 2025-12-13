// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/general', require('./routes/homeRoutes'));
app.use('/api/map', require('./routes/mapRoutes'));
app.use('/api/needs', require('./routes/needsRoutes'));

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});