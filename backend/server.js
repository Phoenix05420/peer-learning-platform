require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const skillRoutes = require('./src/routes/skills');
const requestRoutes = require('./src/routes/requests');
const messageRoutes = require('./src/routes/messages');
const adminRoutes = require('./src/routes/admin');

const app = express();
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:5173', 'https://peer-frontend-leba.onrender.com'];

const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ message: 'PEER Learning API is running' }));

// 404 handler — unknown routes
app.use((req, res, next) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🔴 Unhandled Error:', err.stack || err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
    socket.on('join_request', (requestId) => {
        socket.join(requestId);
    });
    socket.on('send_message', (data) => {
        io.to(data.requestId).emit('receive_message', data);
    });
    socket.on('disconnect', () => { });
});

// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async (retries = 0) => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB connected');
        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        if (retries < 12) {
            console.log(`⏳ Retrying in 5 seconds... (attempt ${retries + 1}/12)`);
            console.log('💡 Make sure MongoDB is running: Start the MongoDB service from Services or run mongod.exe');
            setTimeout(() => startServer(retries + 1), 5000);
        } else {
            console.error('❌ Could not connect to MongoDB after 12 attempts. Exiting.');
            process.exit(1);
        }
    }
};

startServer();
