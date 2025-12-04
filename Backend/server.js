// server.js
require('dotenv').config();
const express = require('express');// Importing express module
const cors = require('cors');// Importing cors module use to handle cross-origin requests
//const connectDB = require('./config/db');// Importing database connection function
const mongoose = require('mongoose');

const app = express();

// 1. Connect to Database
//connectDB();

// 2. Middleware (Allows us to read JSON data sent by frontend)
app.use(express.json());
app.use(cors());// Allows your friends' React frontend to talk to this backend

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to ResQLink Database'))
    .catch(err => console.log(err));

// 3. Define Routes (We will create these files next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/general', require('./routes/general'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});