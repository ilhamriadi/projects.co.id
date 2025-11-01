import express from 'express';
import authRoutes from './auth.js';
import disasterRoutes from './disasters.js';

const router = express.Router();

// API version
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API v1 - Sistem Pendataan Terdampak Bencana',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const database = (await import('../config/database.js')).default;
        const dbHealth = await database.healthCheck();

        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            data: {
                server: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: process.version
                },
                database: dbHealth
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server health check failed',
            error: error.message
        });
    }
});

// API routes
router.use('/auth', authRoutes);
router.use('/disasters', disasterRoutes);

export default router;