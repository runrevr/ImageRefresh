import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('🔥 Unexpected database pool error:', err);
  // Don't exit the process, let the pool handle reconnection
});

// Handle client connection errors
pool.on('connect', () => {
  console.log('✅ Database client connected');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('📡 Closing database pool...');
  pool.end(() => {
    console.log('📡 Database pool closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('📡 Closing database pool...');
  pool.end(() => {
    console.log('📡 Database pool closed');
    process.exit(0);
  });
});

export default pool;