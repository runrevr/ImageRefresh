import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function testConnection() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    console.log('Database connected successfully');
    
    // Test user images query
    const result = await client.query('SELECT id, user_id, image_path, image_url, image_type, category FROM user_images WHERE user_id = 6 LIMIT 3');
    console.log(`Found ${result.rows.length} images for user 6:`);
    console.log(JSON.stringify(result.rows, null, 2));
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testConnection();