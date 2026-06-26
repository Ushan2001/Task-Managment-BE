const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

process.env.TZ = 'Asia/Colombo';

const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const taskRoutes = require('./routes/task-routes');

const app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management System API is running'
    });
});

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGODB_URI;

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Database Connected');

        app.listen(PORT, () => {
            console.log(`Server Running on PORT ${PORT}`);
        });
    } catch (err) {
        console.error('Database Connection Error: ', err);
        process.exit(1);
    }
};

startServer();
