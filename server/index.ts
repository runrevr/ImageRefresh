import express from "express";
import { config } from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { setupVite } from "./vite.js";

config();

const app = express();
const port = parseInt(process.env.PORT || "5000");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("attached_assets"));
app.use(express.static("public"));
app.use(express.static("client/public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = "uploads";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000000);
    cb(
      null,
      `images-${timestamp}-${randomNum}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// API config endpoint
app.get("/api/config", (req, res) => {
  res.json({
    featureFlags: {
      newUI: true,
    },
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    stripeConfigured: true,
    maxUploadSize: 10 * 1024 * 1024,
  });
});

// Text-to-image generation endpoint is now handled by upload-enhance-api.ts

// Basic image upload endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Serve static files from the client dist directory
app.use(express.static(path.join(process.cwd(), "dist", "public")));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Also serve assets from the client public directory for development
app.use(
  "/images",
  express.static(path.join(process.cwd(), "client", "public", "images")),
);
app.use(
  "/examples",
  express.static(path.join(process.cwd(), "client", "public", "examples")),
);

// Serve specific HTML files
app.get("/text-to-image", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "text-to-image.html"));
});

// Handle all other routes - serve the React app
app.get("*", (req, res) => {
  // Don't serve the React app for static HTML files (except index.html)
  if (req.path.endsWith(".html") && req.path !== "/index.html") {
    return res.status(404).send("Not found");
  }

  // Don't serve the React app for static asset files
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];
  if (staticExtensions.some((ext) => req.path.endsWith(ext))) {
    return res.status(404).send("Not found");
  }

  const indexPath = path.join(process.cwd(), "dist", "public", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(404)
      .send("Application not built. Please run the build process.");
  }
});

// Import only the route files that actually exist
import uploadEnhanceRoutes from "./routes/upload-enhance-api.js";

app.use("/api", uploadEnhanceRoutes);

const server = createServer(app);

// Setup Vite in development mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`Vite development server configured: ${process.env.NODE_ENV !== "production"}`);
  });
}

startServer().catch(console.error);
