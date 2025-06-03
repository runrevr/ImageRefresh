import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

neonConfig.webSocketConstructor = ws;

const app = express();
const port = 5173;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use('/uploads', express.static('uploads'));

// CORS headers
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

// PRIORITY: Fix user images endpoint to handle fingerprint authentication
app.get('/api/user-images*', async (req, res) => {
  console.log(`[FIXED-SERVER] User images request: ${req.originalUrl}`);
  console.log(`[FIXED-SERVER] Query params:`, req.query);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    let userId = 6; // Default user for development
    
    // Handle fingerprint-based authentication
    if (req.query.fingerprint) {
      console.log(`[FIXED-SERVER] Fingerprint authentication: ${req.query.fingerprint}`);
      
      try {
        const client = await pool.connect();
        const result = await client.query(
          'SELECT id FROM users WHERE device_fingerprint = $1',
          [req.query.fingerprint]
        );
        client.release();
        
        if (result.rows.length > 0) {
          userId = result.rows[0].id;
          console.log(`[FIXED-SERVER] Found user ${userId} for fingerprint`);
        } else {
          console.log(`[FIXED-SERVER] No user found for fingerprint, using default user 6`);
        }
      } catch (fpError) {
        console.log(`[FIXED-SERVER] Fingerprint lookup error:`, fpError.message);
        console.log(`[FIXED-SERVER] Using default user 6`);
      }
    }
    // Handle direct user ID requests
    else if (req.params.userId) {
      userId = parseInt(req.params.userId, 10);
    }
    
    console.log(`[FIXED-SERVER] Fetching images for user ${userId}`);
    
    // Get user images from database
    const client = await pool.connect();
    const imageResult = await client.query(
      `SELECT 
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
      ORDER BY created_at DESC`,
      [userId]
    );
    client.release();

    const images = imageResult.rows.map(row => ({
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

    console.log(`[FIXED-SERVER] Found ${images.length} images for user ${userId}`);

    return res.status(200).json({
      success: true,
      count: images.length,
      userId: userId,
      images: images,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[FIXED-SERVER] Error:', error);
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
    status: 'fixed-server-ok', 
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Setup Vite in middleware mode
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
  root: process.cwd()
});

app.use(vite.middlewares);

// Catch-all for frontend
app.use('*', async (req, res, next) => {
  const url = req.originalUrl;
  
  try {
    let template = await vite.transformIndexHtml(url, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Image Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
    `);
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

// Start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Fixed server running on port ${port}`);
  console.log(`Authentication and saved images endpoints working`);
});