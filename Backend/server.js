// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware (Allows us to read JSON data sent by frontend)
app.use(express.json());
app.use(cors());

// 3. Define Routes (We will create these files next)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/general', require('./routes/general'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});