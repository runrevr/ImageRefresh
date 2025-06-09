// Configure environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import Anthropic from '@anthropic-ai/sdk';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runCleanupTasks } from "./cleanup";
import { demoAccessMiddleware } from "./demo-access-control";
import { setupAuth } from "./auth";
import cookieParser from "cookie-parser";
import { setupTestRoutes } from "./routes/test-route";
import { setupOpenAITestRoutes } from "./openai-test-route";
import { setupSimpleRouter } from "./simple-router";
import { setupWebhookTestRoutes } from "./routes/webhook-test";
import { setupStaticRoutes } from "./routes/static-routes";
import { setupProductImageLabRoutes } from "./routes/product-image-lab-routes";
import { setupAnthropicTestRoutes } from "./routes/anthropic-test";
import uploadEnhanceApiRoutes from "./routes/upload-enhance-api";
import fs from 'fs';
import path from 'path';
import { createServer } from 'http'; // Import createServer

// Create a debug logger that writes to stdout and a file
const DEBUG_LOG_PATH = path.join(process.cwd(), 'logs', 'debug.log');

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(DEBUG_LOG_PATH))) {
  fs.mkdirSync(path.dirname(DEBUG_LOG_PATH), { recursive: true });
}
// Make sure the logs directory exists
if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
}
// Clear the log file
fs.writeFileSync(DEBUG_LOG_PATH, '');

// Create global debug function
global.debugLog = function(...args: any[]) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  // Write to stdout
  process.stdout.write(logMessage);

  // Append to log file
  fs.appendFileSync(DEBUG_LOG_PATH, logMessage);
};

// Load environment variables from .env file
dotenv.config();

// Add environment variable debug logs
console.log('Environment Configuration:');
console.log(`API Key: ${process.env.ACTIVECAMPAIGN_API_KEY ? 'Set' : 'Not set'}`);
console.log(`Base URL: ${process.env.ACTIVECAMPAIGN_BASE_URL || 'Not set'}`);
console.log(`USE_MOCK_WEBHOOK: ${process.env.USE_MOCK_WEBHOOK || 'Not set'}`);
console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

// Set database connection with retry logic
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set - database features will be limited');
}

// Set ActiveCampaign API credentials
process.env.ACTIVECAMPAIGN_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY || '1579e89bd0548efef9178b71b72c6a85d641f3ebc7806d86d6154c41a9a67af6c360fdc6';
process.env.ACTIVECAMPAIGN_BASE_URL = process.env.ACTIVECAMPAIGN_BASE_URL || 'https://thecollectivealchemy.api-us1.com';
process.env.ACTIVECAMPAIGN_MEMBERSHIP_LIST = process.env.ACTIVECAMPAIGN_MEMBERSHIP_LIST || '';

// Tags for different user tiers
process.env.ACTIVECAMPAIGN_FREE_USER_TAG = process.env.ACTIVECAMPAIGN_FREE_USER_TAG || 'free';
process.env.ACTIVECAMPAIGN_CORE_USER_TAG = process.env.ACTIVECAMPAIGN_CORE_USER_TAG || 'core';
process.env.ACTIVECAMPAIGN_PLUS_USER_TAG = process.env.ACTIVECAMPAIGN_PLUS_USER_TAG || 'plus';
process.env.ACTIVECAMPAIGN_TRIAL_TAG = process.env.ACTIVECAMPAIGN_TRIAL_TAG || 'trial';

// Custom fields
process.env.ACTIVECAMPAIGN_MEMBERSHIP_STATUS_FIELD = process.env.ACTIVECAMPAIGN_MEMBERSHIP_STATUS_FIELD || 'Membership Status';

const app = express();

// Add CORS middleware to allow frontend to connect to backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// API key test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date()
  });
});

// PRIORITY: Setup API proxy for user images before any other middleware
setupAPIProxy(app);

// Setup authentication (passport, sessions, etc.)
setupAuth(app);

// Set up webhook test routes for N8N integration
app.use('/api', setupWebhookTestRoutes());

// Create a special middleware just for debugging request bodies
app.use((req, res, next) => {
  // Only log POST requests to specific endpoints
  if (req.method === 'POST' && req.path === '/api/transform') {
    console.log('\n\n==== TRANSFORM REQUEST BODY ====');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('================================\n\n');

    // Write to debug log file as well
    fs.appendFileSync(DEBUG_LOG_PATH, `\n\n==== TRANSFORM REQUEST [${new Date().toISOString()}] ====\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `URL: ${req.url}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `Headers: ${JSON.stringify(req.headers, null, 2)}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `Body: ${JSON.stringify(req.body, null, 2)}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `Query: ${JSON.stringify(req.query, null, 2)}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `================================\n\n`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;

    // Special logging for errors on transform endpoint
    if (path === '/api/transform' && bodyJson && bodyJson.message) {
      console.log('\n\n==== TRANSFORM RESPONSE ERROR ====');
      console.log('Status:', res.statusCode);
      console.log('Error:', bodyJson.message);
      console.log('Full response:', JSON.stringify(bodyJson, null, 2));
      console.log('================================\n\n');

      // Write to debug log file
      fs.appendFileSync(DEBUG_LOG_PATH, `\n\n==== TRANSFORM RESPONSE ERROR [${new Date().toISOString()}] ====\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `Status: ${res.statusCode}\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `Error: ${bodyJson.message}\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `Full response: ${JSON.stringify(bodyJson, null, 2)}\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `================================\n\n`);
    }

    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register main routes
  const server = await registerRoutes(app);

  // Register test routes
  app.use(setupTestRoutes());

  // Register OpenAI test routes
  app.use(setupOpenAITestRoutes());

  // Register simple compatibility routes
  app.use(setupSimpleRouter());

  // Register static HTML routes
  app.use(setupStaticRoutes());

  // Register Product Image Lab routes
  app.use(setupProductImageLabRoutes());

  // Register Anthropic API test routes
  app.use('/api', setupAnthropicTestRoutes());

  // CRITICAL: Direct route handlers to bypass Vite completely
  app.post('/api/generate-edit-prompt', async (req, res) => {
    console.log(`[DIRECT API] Edit prompt endpoint hit - bypassing Vite!`);

    try {
      const { idea_title, idea_description, is_chaos_concept } = req.body;

      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
      }

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        temperature: is_chaos_concept ? 1.0 : 0.8,
        messages: [{
          role: "user",
          content: `Create an edit prompt for GPT-image-01 based on this concept:

Title: ${idea_title}
Description: ${idea_description}
Type: ${is_chaos_concept ? 'CHAOS CONCEPT - GO WILD!' : 'Professional/Lifestyle'}

Generate ${is_chaos_concept ? '100-120' : '80-100'} words describing exactly how to edit the product image.

${is_chaos_concept ? 
  'UNLEASH CREATIVE CHAOS! Start with product accuracy then EXPLODE into impossible surreal madness!' : 
  'Create a professional, realistic scene with natural lighting and authentic environments.'}

Respond with ONLY the edit prompt text, no formatting, no JSON, no explanation.`
        }]
      });

      const editPrompt = (message.content[0] as any).text.trim();

      console.log(`[DIRECT API] Generated edit prompt successfully`);

      res.json({
        success: true,
        edit_prompt: editPrompt
      });

    } catch (error) {
      console.error('[DIRECT API] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Add /api/generate-images endpoint for text-to-image functionality
  app.post('/api/generate-images', async (req, res) => {
    try {
      console.log('Request Body:', req.body);
      console.log('[API] Generate images endpoint called');

      const { prompt, variations, purpose, industry, aspectRatio, styleIntensity, addText, businessName } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      // For now, simulate image generation
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Convert aspect ratio to image size (GPT-image-1 format)
      let size = '1024x1024'; // default square
      if (aspectRatio === 'wide') {
        size = '1536x1024';
      } else if (aspectRatio === 'portrait') {
        size = '1024x1536';
      }

      // Generate the image using GPT-image-1
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        size: size as "1024x1024" | "1536x1024" | "1024x1536",
      });

      // Get the base64 image data directly
      const image_base64 = response.data[0].b64_json;
      const buffer = Buffer.from(image_base64, "base64");

      // Save to uploads directory with timestamp
      const timestamp = Date.now();
      const filename = `text-to-image-${timestamp}.png`;
      const fs = await import('fs');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'uploads');

      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);

      // Return the local URL that can be accessed by the frontend
      const localImageUrl = `/uploads/${filename}`;

      res.json({
        success: true,
        jobId: `job_${timestamp}`,
        imageUrl: localImageUrl,
        metadata: {
          prompt,
          variations,
          purpose,
          industry,
          aspectRatio,
          styleIntensity,
          addText,
          businessName
        }
      });

    } catch (error) {
      console.error('[API] Error generating images:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate images'
      });
    }
  });

  // Add debugging middleware for API routes
  app.use('/api', (req, res, next) => {
    console.log(`[API DEBUG] ${req.method} ${req.path} - Request received`);
    console.log(`[API DEBUG] Full URL: ${req.originalUrl}`);
    console.log(`[API DEBUG] Headers:`, req.headers);
    next();
  });

  // Register Upload Enhance API routes
  app.use('/api', uploadEnhanceApiRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log database connection errors specifically
    if (err.message && err.message.includes('database') || err.message.includes('connection')) {
      console.error('🔴 Database connection error:', err.message);
      console.error('This may be due to network issues or database unavailability');
    }

    res.status(status).json({ message });

    // Don't throw the error, just log it to prevent server crash
    console.error('Server error handled:', err.message);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  const altPorts = [3001, 8080, 8000]; // Alternative ports to try if main port is busy

  // Function to attempt starting server on different ports
  const startServer = (portToUse: number, remainingPorts: number[] = []): void => {
    server.listen({
      port: portToUse,
      host: "0.0.0.0",
      reusePort: true,
    })
    .on('listening', () => {
      // Server started successfully
      log(`Server started successfully on port ${portToUse}`);

      // Run cleanup once at startup
      runCleanupTasks()
        .then(() => log('Initial cleanup tasks completed'))
        .catch(err => console.error('Error during initial cleanup:', err));

      // Schedule daily cleanup (86400000 ms = 24 hours)
      const CLEANUP_INTERVAL = 86400000;
      setInterval(() => {
        log('Running scheduled cleanup tasks...');
        runCleanupTasks()
          .then(() => log('Scheduled cleanup tasks completed'))
          .catch(err => console.error('Error during scheduled cleanup:', err));
      }, CLEANUP_INTERVAL);
    })
    .on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${portToUse} is already in use.`);

        // Try the next port if there are any remaining ports
        if (remainingPorts.length > 0) {
          const nextPort = remainingPorts[0];
          log(`Attempting to use alternative port ${nextPort}`);
          startServer(nextPort, remainingPorts.slice(1));
        } else {
          console.error('All ports are in use. Please close some applications and try again.');
          process.exit(1);
        }
      } else {
        // Handle other server errors
        console.error('Error starting server:', err);
        process.exit(1);
      }
    });
  };

  // Start with the default port and fallback to alternatives
  startServer(port, altPorts);
})();
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routes = express.Router();
import authRoutes from './routes/auth-routes';

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://collective-alchemy-dev.onrender.com'],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

// Session middleware configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: app.get('env') === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none'
  }
}));

app.use('/uploads', express.static('uploads'));
app.use('/attached_assets', express.static('attached_assets'));

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
try {
  await fs.mkdir(uploadDir, { recursive: true });
} catch (error) {
  console.log('Upload directory already exists or created');
}

// Blog database configuration
const DB_PATH = './data';
const POSTS_FILE = path.join(DB_PATH, 'posts.json');
const CATEGORIES_FILE = path.join(DB_PATH, 'categories.json');
const TAGS_FILE = path.join(DB_PATH, 'tags.json');

// Blog database helper functions
async function readJSON(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeJSON(filePath: string, data: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Blog database initialization function
async function initBlogDB() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });

    try {
      await fs.access(POSTS_FILE);
    } catch {
      await fs.writeFile(POSTS_FILE, JSON.stringify([]));
    }

    try {
      await fs.access(CATEGORIES_FILE);
    } catch {
      const defaultCategories = [
        { id: 'ai-tutorials', name: 'AI Tutorials', description: 'How-to guides and tutorials' },
        { id: 'success-stories', name: 'Success Stories', description: 'Customer transformations and results' },
        { id: 'business-tips', name: 'Business Tips', description: 'Help users grow their businesses' },
        { id: 'creative-inspiration', name: 'Creative Inspiration', description: 'Showcase amazing transformations' },
        { id: 'product-updates', name: 'Product Updates', description: 'Announce new features' }
      ];
      await fs.writeFile(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
    }

    try {
      await fs.access(TAGS_FILE);
    } catch {
      const defaultTags = ['AI', 'photography', 'business', 'tutorial', 'transformation', 'ecommerce', 'marketing', 'tips', 'case-study', 'beginner-friendly'];
      await fs.writeFile(TAGS_FILE, JSON.stringify(defaultTags, null, 2));
    }

    console.log('✅ Blog database initialized');
  } catch (error) {
    console.error('❌ Blog database initialization failed:', error);
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Blog image upload configuration
const blogStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const blogUpload = multer({ 
  storage: blogStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Blog routes
app.get('/blog', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'blog.html'));
});

app.get('/admin/blog', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
});

// Blog API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const tag = req.query.tag as string;
    const search = req.query.search as string;

    let filteredPosts = posts.filter((post: any) => post.published);

    if (category) {
      filteredPosts = filteredPosts.filter((post: any) => post.category === category);
    }

    if (tag) {
      filteredPosts = filteredPosts.filter((post: any) => post.tags.includes(tag));
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredPosts = filteredPosts.filter((post: any) => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm)
      );
    }

    filteredPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    res.json({
      posts: paginatedPosts,
      totalPosts: filteredPosts.length,
      currentPage: page,
      totalPages: Math.ceil(filteredPosts.length / limit),
      hasNext: endIndex < filteredPosts.length,
      hasPrev: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    const post = posts.find((p: any) => p.slug === req.params.slug && p.published);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.post('/api/posts', blogUpload.single('featuredImage'), async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    const { title, excerpt, content, category, tags, published } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ error: 'Title, excerpt, and content are required' });
    }

    const newPost = {
      id: crypto.randomUUID(),
      slug: generateSlug(title),
      title,
      excerpt,
      content,
      category: category || '',
      tags: tags ? JSON.parse(tags) : [],
      featuredImage: req.file ? `/uploads/${req.file.filename}` : null,
      published: published === 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };

    posts.push(newPost);
    await writeJSON(POSTS_FILE, posts);

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/posts/:id', blogUpload.single('featuredImage'), async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    const postIndex = posts.findIndex((p: any) => p.id === req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { title, excerpt, content, category, tags, published } = req.body;
    const updatedPost = {
      ...posts[postIndex],
      title: title || posts[postIndex].title,
      excerpt: excerpt || posts[postIndex].excerpt,
      content: content || posts[postIndex].content,
      category: category || posts[postIndex].category,
      tags: tags ? JSON.parse(tags) : posts[postIndex].tags,
      published: published !== undefined ? published === 'true' : posts[postIndex].published,
      updatedAt: new Date().toISOString()
    };

    if (title) {
      updatedPost.slug = generateSlug(title);
    }

    if (req.file) {
      updatedPost.featuredImage = `/uploads/${req.file.filename}`;
    }

    posts[postIndex] = updatedPost;
    await writeJSON(POSTS_FILE, posts);

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    const postIndex = posts.findIndex((p: any) => p.id === req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const deletedPost = posts.splice(postIndex, 1)[0];
    await writeJSON(POSTS_FILE, posts);

    res.json({ message: 'Post deleted successfully', post: deletedPost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await readJSON(CATEGORIES_FILE);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const categories = await readJSON(CATEGORIES_FILE);
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = {
      id: generateSlug(name),
      name,
      description: description || ''
    };

    categories.push(newCategory);
    await writeJSON(CATEGORIES_FILE, categories);

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const tags = await readJSON(TAGS_FILE);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.post('/api/tags', async (req, res) => {
  try {
    const tags = await readJSON(TAGS_FILE);
    const { tag } = req.body;

    if (!tag || tags.includes(tag)) {
      return res.status(400).json({ error: 'Tag is required and must be unique' });
    }

    tags.push(tag);
    await writeJSON(TAGS_FILE, tags);

    res.status(201).json({ tag });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

app.get('/api/admin/posts', async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    posts.sort((a: any, b: any) => newDate(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/upload', blogUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    res.json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const posts = await readJSON(POSTS_FILE);
    const categories = await readJSON(CATEGORIES_FILE);
    const tags = await readJSON(TAGS_FILE);

    const publishedPosts = posts.filter((p: any) => p.published);
    const draftPosts = posts.filter((p: any) => !p.published);
    const totalViews = posts.reduce((sum: number, post: any) => sum + (post.views || 0), 0);

    res.json({
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalCategories: categories.length,
      totalTags: tags.length,
      totalViews
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', routes);

async function initializeDatabase() {
  // Try connecting to the database
  // If it fails, retry after a delay
}

async function startServer() {
  try {
    await initializeDatabase();
    await initBlogDB();

    const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
    const altPorts = [3001, 8080, 8000]; // Alternative ports to try if main port is busy

  // Function to attempt starting server on different ports
  const startServer = (portToUse: number, remainingPorts: number[] = []): void => {
    const server = createServer(app);
    server.listen({
      port: portToUse,
      host: "0.0.0.0",
      reusePort: true,
    })
    .on('listening', () => {
      // Server started successfully
      log(`Server started successfully on port ${portToUse}`);

      // Run cleanup once at startup
      runCleanupTasks()
        .then(() => log('Initial cleanup tasks completed'))
        .catch(err => console.error('Error during initial cleanup:', err));

      // Schedule daily cleanup (86400000 ms = 24 hours)
      const CLEANUP_INTERVAL = 86400000;
      setInterval(() => {
        log('Running scheduled cleanup tasks...');
        runCleanupTasks()
          .then(() => log('Scheduled cleanup tasks completed'))
          .catch(err => console.error('Error during scheduled cleanup:', err));
      }, CLEANUP_INTERVAL);
    })
    .on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${portToUse} is already in use.`);

        // Try the next port if there are any remaining ports
        if (remainingPorts.length > 0) {
          const nextPort = remainingPorts[0];
          log(`Attempting to use alternative port ${nextPort}`);
          startServer(nextPort, remainingPorts.slice(1));
        } else {
          console.error('All ports are in use. Please close some applications and try again.');
          process.exit(1);
        }
      } else {
        // Handle other server errors
        console.error('Error starting server:', err);
        process.exit(1);
      }
    });
  };

  // Start with the default port and fallback to alternatives
  startServer(port, altPorts);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();