import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            if (this.isConnected && this.pool) {
                return this.pool;
            }

            const databaseUrl = process.env.DATABASE_URL;

            if (!databaseUrl) {
                throw new Error('DATABASE_URL environment variable is required');
            }

            this.pool = new pg.Pool({
                connectionString: databaseUrl,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 20, // Maximum number of connections in pool
                idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
                connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection not established
            });

            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            this.isConnected = true;

            // Handle pool errors
            this.pool.on('error', (err) => {
                console.error('Unexpected database pool error:', err);
                this.isConnected = false;
            });

            console.log('✅ Database connected successfully');
            return this.pool;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    async query(text, params) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            const client = await this.pool.connect();
            try {
                const result = await client.query(text, params);
                return result;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('🔌 Database connection closed');
        }
    }

    getPool() {
        return this.pool;
    }

    // Health check method
    async healthCheck() {
        try {
            const result = await this.query('SELECT NOW() as timestamp, version() as version');
            return {
                status: 'healthy',
                timestamp: result.rows[0].timestamp,
                version: result.rows[0].version,
                isConnected: this.isConnected
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                isConnected: false
            };
        }
    }
}

// Create singleton instance
const database = new Database();

export default database;