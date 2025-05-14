import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImageWithOpenAI } from "./openai-image";

// Configure multer for uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imagePath = req.file.path;
      const relativePath = path.relative(process.cwd(), imagePath).replace(/\\/g, '/');

      res.json({
        imagePath: relativePath,
        imageUrl: `/${relativePath}`
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file", error: error.message });
    }
  });

  app.post("/api/transform", async (req, res) => {
    try {
      const { originalImagePath, prompt } = req.body;

      if (!originalImagePath || !prompt) {
        return res.status(400).json({ message: "Original image path and prompt are required" });
      }

      const imagePath = path.join(process.cwd(), originalImagePath);
      const transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);

      res.json({
        transformedImagePath,
        transformedImageUrl: `/${transformedImagePath}`
      });
    } catch (error: any) {
      console.error("Error transforming image:", error);
      res.status(500).json({ message: "Error transforming image", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}