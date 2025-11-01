import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import database from './config/database.js';
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store connected users
const connectedUsers = new Map();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add socket.io instance to request object for real-time notifications
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
        path: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.message
        });
    }

    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Default error response
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle user authentication for socket
    socket.on('authenticate', async (token) => {
        try {
            const jwt = (await import('jsonwebtoken')).default;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user details from database
            const User = (await import('./models/User.js')).default;
            const user = await User.findById(decoded.userId);

            if (user) {
                connectedUsers.set(socket.id, {
                    userId: user.id,
                    userRole: user.role,
                    kecamatan: user.kecamatan,
                    desa: user.desa
                });

                // Join user to role-based room
                socket.join(user.role);

                // Join user to area-based rooms
                if (user.kecamatan) {
                    socket.join(`kecamatan_${user.kecamatan}`);
                }
                if (user.desa) {
                    socket.join(`desa_${user.kecamatan}_${user.desa}`);
                }

                console.log(`User ${user.email} authenticated on socket ${socket.id}`);
                socket.emit('authenticated', { success: true, user });
            } else {
                socket.emit('authentication_error', { message: 'User not found' });
            }
        } catch (error) {
            console.error('Socket authentication error:', error);
            socket.emit('authentication_error', { message: 'Invalid token' });
        }
    });

    // Handle joining specific rooms
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle real-time disaster updates
    socket.on('disaster_update', (data) => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            // Broadcast to relevant users based on role and area
            if (user.userRole === 'bpbd') {
                // BPBD users receive all updates
                io.to('bpbd').emit('disaster_updated', {
                    ...data,
                    updated_by: user.userId
                });
            } else if (user.userRole === 'kecamatan') {
                // Kecamatan users receive updates for their area
                io.to(`kecamatan_${user.kecamatan}`).emit('disaster_updated', {
                    ...data,
                    updated_by: user.userId
                });
            } else if (user.userRole === 'desa') {
                // Desa users receive updates for their specific area
                io.to(`desa_${user.kecamatan}_${user.desa}`).emit('disaster_updated', {
                    ...data,
                    updated_by: user.userId
                });
            }
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        connectedUsers.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');

    server.close(async () => {
        console.log('HTTP server closed');

        try {
            await database.close();
            console.log('Database connections closed');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');

    server.close(async () => {
        console.log('HTTP server closed');

        try {
            await database.close();
            console.log('Database connections closed');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Connect to database
        await database.connect();
        console.log('✅ Database connected successfully');

        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 API available at: http://localhost:${PORT}/api/v1`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
            console.log(`🔌 Socket.IO server ready`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

export default app;