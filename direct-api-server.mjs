import express from 'express';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const app = express();
const port = 4000;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Direct user images endpoint
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[DIRECT-API] Processing request for user ${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    const query = `
      SELECT 
        id,
        user_id,
        image_url,
        image_type,
        category,
        original_image_path,
        is_variant,
        parent_image_id,
        created_at
      FROM user_images 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;

    const client = await pool.connect();
    const result = await client.query(query, [userId]);
    client.release();

    const images = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      imageUrl: row.image_url,
      imageType: row.image_type,
      category: row.category || 'personal',
      originalImagePath: row.original_image_path,
      isVariant: row.is_variant || false,
      parentImageId: row.parent_image_id,
      createdAt: row.created_at
    }));

    console.log(`[DIRECT-API] Found ${images.length} images for user ${userId}`);

    return res.status(200).json({
      success: true,
      count: images.length,
      userId: userId,
      images: images,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[DIRECT-API] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user images',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'direct-api-ok', 
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Direct API server running on port ${port}`);
  console.log(`Test: curl "http://localhost:${port}/api/user-images/6"`);
});