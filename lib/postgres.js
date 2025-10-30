import pg from 'pg';
import process from 'process';

const { Pool } = pg;

let pool;

/**
 * Returns a promise that resolves to a PostgreSQL connection pool.
 * Initializes the pool if it doesn't already exist.
 * Optimized for Vercel serverless + Neon PostgreSQL
 */
export async function getConnection() {
    if (!pool) {
        let connectionString;
        
        // Get database URL from environment (Neon PostgreSQL connection string)
        connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            // Fall back to individual environment variables for local development
            const host = process.env.DB_HOST;
            const user = process.env.DB_USER;
            const password = process.env.DB_PASSWORD;
            const database = process.env.DB_NAME;
            const port = process.env.DB_PORT || 5432;
            
            if (!host || !user || !password || !database) {
                throw new Error('DATABASE_URL or individual DB_* environment variables must be set.');
            }
            
            connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
        }

        pool = new Pool({
            connectionString,
            // Optimize for serverless environment (Vercel)
            max: 5, // Maximum number of clients
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        });

        // Test the connection
        try {
            const client = await pool.connect();
            console.log('✅ Database connection established successfully');
            client.release();
        } catch (error) {
            console.error('❌ Failed to establish database connection:', error.message);
            pool = undefined;
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }
    return pool;
}