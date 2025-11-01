import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseMigration {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            // Parse database URL from environment
            const databaseUrl = process.env.DATABASE_URL;

            if (!databaseUrl) {
                throw new Error('DATABASE_URL environment variable is required');
            }

            // Create connection pool
            this.pool = new pg.Pool({
                connectionString: databaseUrl,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });

            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            console.log('✅ Database connected successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async runMigrations() {
        try {
            console.log('🔄 Running database migrations...');

            // Read and execute schema file
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');

            // Split schema into individual statements
            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            const client = await this.pool.connect();

            try {
                // Start transaction
                await client.query('BEGIN');

                // Execute each statement
                for (const statement of statements) {
                    try {
                        await client.query(statement + ';');
                    } catch (error) {
                        console.warn(`⚠️  Warning in statement: ${statement.substring(0, 50)}...`);
                        console.warn(`   Error: ${error.message}`);
                    }
                }

                // Commit transaction
                await client.query('COMMIT');

                console.log('✅ Database migrations completed successfully');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migrations if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
    const migration = new DatabaseMigration();

    migration.connect()
        .then(() => migration.runMigrations())
        .then(() => migration.close())
        .catch((error) => {
            console.error('❌ Migration process failed:', error.message);
            migration.close().finally(() => process.exit(1));
        });
}

export default DatabaseMigration;