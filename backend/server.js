const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\n✅ MongoDB Connected Successfully');
        console.log(`📍 Host: ${mongoose.connection.host}`);
        console.log(`📦 Database: ${mongoose.connection.name}\n`);
    } catch (error) {
        console.error('\n❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// ✅ Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        status: '✅ Server Running',
        database: '✅ MongoDB Connected',
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// ✅ Import Routes
const parkingRoutes = require('./routes/parkingRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// ✅ Use Routes
app.use('/api/parkings', parkingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Get Parkings: http://localhost:${PORT}/api/parkings\n`);
});

module.exports = app;
