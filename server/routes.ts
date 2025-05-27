import express, {
  type Express,
  Request,
  Response,
  NextFunction,
} from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import { v4 as uuid } from "uuid";

import { type InsertTransformation } from "../shared/schema";
import { createColoringBookImage } from "./coloring-book";
// Import the Product AI Studio router
import productAiStudioRouter from "./product-ai-studio";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add detailed console logs for debugging
  app.use((req, res, next) => {
    const start = Date.now();

    // Log when the request completes
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
      );
    });

    // Log the request body for POST/PUT requests (exclude large base64 data)
    if (req.method === "POST" || req.method === "PUT") {
      if (req.body && typeof req.body === "object") {
        const logBody = { ...req.body };

        // Exclude large base64 data from logs
        Object.keys(logBody).forEach((key) => {
          if (
            typeof logBody[key] === "string" &&
            logBody[key].length > 1000 &&
            (logBody[key].startsWith("data:image") ||
              logBody[key].includes("base64"))
          ) {
            logBody[key] = `[base64 data - ${logBody[key].length} chars]`;
          } else if (Array.isArray(logBody[key])) {
            logBody[key] = `[Array with ${logBody[key].length} items]`;
          }
        });

        console.log(
          `${new Date().toISOString()} - Request Body: ${JSON.stringify(logBody, null, 2)}`,
        );
      }
    }

    next();
  });

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Register Product AI Studio routes
  app.use('/api/product-ai-studio', productAiStudioRouter);

  // API routes
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Single image upload endpoint
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        // Get the file extension from original filename or use a default
        const fileExt = path.extname(file.originalname).toLowerCase() || ".jpg";
        // Ensure we only use extensions that OpenAI accepts
        const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(fileExt)
          ? fileExt
          : ".png";
        cb(
          null,
          `image-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${safeExt}`,
        );
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
    fileFilter: (req, file, cb) => {
      // Check MIME type (from multer) - only accept valid image types
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        console.log(`Rejected file upload with mimetype: ${file.mimetype}`);
        // Note: multer expects cb(null, false) to silently reject the file
        return cb(null, false);
      }

      // Additional check for file extension
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ext.match(/\.(jpg|jpeg|png|webp)$/i)) {
        console.log(`Rejected file upload with extension: ${ext}`);
        // Note: multer expects cb(null, false) to silently reject the file
        return cb(null, false);
      }

      console.log(
        `Accepted file upload: ${file.originalname}, MIME type: ${file.mimetype}`,
      );
      cb(null, true);
    },
  });

  // Basic file upload endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log(`File uploaded: ${req.file.path}`);

      // Return the path to the uploaded file and a URL
      const baseUrl = req.protocol + "://" + req.get("host");
      const imagePath = req.file.path;
      const relativeImagePath = imagePath
        .replace(process.cwd(), "")
        .replace(/^\//, "");
      const imageUrl = `${baseUrl}/${relativeImagePath}`;

      res.json({
        message: "File uploaded successfully",
        imagePath: imagePath,
        imageUrl: imageUrl,
        filename: req.file.filename,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res
        .status(500)
        .json({ message: error.message || "Error uploading file" });
    }
  });

  // Image transformation endpoint
  app.post("/api/transform", async (req, res) => {
    try {
      console.log(
        "\n\n====================== IMAGE TRANSFORMATION ======================",
      );
      console.log(`Timestamp: ${new Date().toISOString()}`);

      // Validate request body
      const {
        originalImagePath,
        prompt,
        userId,
        imageSize,
        isEdit,
        previousTransformation,
      } = req.body;

      if (!originalImagePath) {
        return res
          .status(400)
          .json({ message: "Original image path is required" });
      }

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      console.log(`Processing transformation with prompt: ${prompt}`);
      console.log(`Original image: ${originalImagePath}`);
      console.log(`Is edit: ${isEdit ? "Yes" : "No"}`);
      console.log(`User ID: ${userId || "Guest"}`);

      // Handle URL vs file path
      let imageSrcPath;
      const isUrl = originalImagePath.startsWith('http');

      if (isUrl) {
        console.log(`Original image is a URL, downloading first`);
        // Download the image from the URL
        try {
          const tempFile = path.join(process.cwd(), 'temp', `downloaded-${Date.now()}.png`);
          const tempDir = path.dirname(tempFile);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          const imgResponse = await axios.get(originalImagePath, { responseType: 'arraybuffer' });
          fs.writeFileSync(tempFile, Buffer.from(imgResponse.data));
          imageSrcPath = tempFile;
          console.log(`Downloaded image to ${imageSrcPath}`);
        } catch (downloadError) {
          console.error(`Error downloading image from URL: ${downloadError.message}`);
          return res.status(404).json({ message: "Failed to download image from URL" });
        }
      } else {
        // It's a regular file path, handle as before
        imageSrcPath = originalImagePath;
      }

      // Determine full path to image (use the downloaded path if it was a URL)
      const fullImagePath = path.isAbsolute(imageSrcPath)
        ? imageSrcPath
        : path.join(process.cwd(), imageSrcPath);

      // Check if image exists
      if (!fs.existsSync(fullImagePath)) {
        return res.status(404).json({ message: "Image file not found" });
      }

      // If previous transformation ID is provided, validate it
      let prevTransform = null;
      if (previousTransformation) {
        try {
          prevTransform = await storage.getTransformation(
            previousTransformation,
          );
          if (!prevTransform) {
            console.warn(
              `Previous transformation ${previousTransformation} not found`,
            );
          } else {
            console.log(
              `Found previous transformation: ID ${previousTransformation}, edits used: ${prevTransform.editsUsed || 0}`,
            );
          }
        } catch (error) {
          console.error("Error retrieving previous transformation:", error);
        }
      }

      // Detailed debugging for edits
      if (isEdit) {
        console.log(
          "==================== DETAILED EDIT DEBUG ====================",
        );
        console.log(
          `Edit requested for previous transformation ID: ${previousTransformation}`,
        );

        if (prevTransform) {
          console.log("Previous transformation details:");
          console.log(JSON.stringify(prevTransform, null, 2));

          if (prevTransform.transformedPath) {
            console.log(
              `Checking if file exists at: ${prevTransform.transformedPath}`,
            );
            const fileExists = fs.existsSync(prevTransform.transformedPath);
            console.log(`File exists: ${fileExists}`);

            if (!fileExists) {
              // Try to list files in the directory
              try {
                const dir = path.dirname(prevTransform.transformedPath);
                console.log(`Looking for files in directory: ${dir}`);
                if (fs.existsSync(dir)) {
                  const files = fs.readdirSync(dir);
                  console.log(`Files in directory: ${files.length} files`);

                  if (files.length > 0) {
                    console.log(
                      `Sample files: ${files.slice(0, 5).join(", ")}${files.length > 5 ? "..." : ""}`,
                    );
                  }
                } else {
                  console.log(`Directory does not exist: ${dir}`);
                }
              } catch (dirError) {
                console.error(`Error listing directory: ${dirError.message}`);
              }
            }
          } else {
            console.log("No transformedPath in previous transformation!");
          }
        } else {
          console.log(
            `Could not find previous transformation with ID: ${previousTransformation}`,
          );
        }
        console.log(
          "==============================================================",
        );
      }

      // Determine the source path for transformation
      let sourceImagePath = fullImagePath;
      if (isEdit && prevTransform && prevTransform.transformedPath) {
        if (fs.existsSync(prevTransform.transformedPath)) {
          sourceImagePath = prevTransform.transformedPath;
          console.log(
            `Using previous transformation path for edit: ${sourceImagePath}`,
          );
        } else {
          console.warn(
            `Previous transformation file not found at: ${prevTransform.transformedPath}`,
          );

          // Try to find any transformed file in uploads directory
          try {
            const uploadsDir = path.join(process.cwd(), "uploads");
            console.log(`Searching uploads directory: ${uploadsDir}`);

            if (fs.existsSync(uploadsDir)) {
              const files = fs.readdirSync(uploadsDir);
              const transformedFiles = files.filter((f) =>
                f.startsWith("transformed-"),
              );

              if (transformedFiles.length > 0) {
                // Sort to get most recent
                transformedFiles.sort();
                const mostRecent =
                  transformedFiles[transformedFiles.length - 1];
                const fallbackPath = path.join(uploadsDir, mostRecent);

                if (fs.existsSync(fallbackPath)) {
                  sourceImagePath = fallbackPath;
                  console.log(
                    `Using fallback path for edit: ${sourceImagePath}`,
                  );
                }
              }
            }
          } catch (searchError) {
            console.error(
              `Error searching for transformed files: ${searchError.message}`,
            );
          }
        }
      }

      // Log the final path being used
      console.log(
        `Final source image path for transformation: ${sourceImagePath}`,
      );
      console.log(
        `Does final source path exist? ${fs.existsSync(sourceImagePath)}`,
      );

      // Check if user has credits if userId is provided
      let userCredits = { freeCreditsUsed: false, paidCredits: 0 };

      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          // Check if the user has free credits
          const hasMonthlyFreeCredit =
            await storage.checkAndResetMonthlyFreeCredit(userId);
          userCredits = {
            freeCreditsUsed: !hasMonthlyFreeCredit,
            paidCredits: user.paidCredits,
          };

          // For edits beyond the first one, we need to check paid credits
          if (isEdit && prevTransform && (prevTransform.editsUsed || 0) > 0) {
            // This is beyond the first edit, check if user has paid credits
            if (user.paidCredits < 1) {
              return res.status(403).json({
                message: "Not enough credits for additional edits",
                error: "credit_required",
              });
            }
          }
          // For new transformations, check if user has any credits
          else if (
            !isEdit &&
            userCredits.freeCreditsUsed &&
            user.paidCredits < 1
          ) {
            return res.status(403).json({
              message: "Not enough credits",
              error: "credit_required",
            });
          }

          // Simple credit check - user needs either free credit or paid credits
          const totalCredits = (hasMonthlyFreeCredit ? 1 : 0) + user.paidCredits;
          console.log(`Credit check for user ${userId}:`, {
            hasMonthlyFreeCredit,
            paidCredits: user.paidCredits,
            totalCredits,
            freeCreditsUsed: user.freeCreditsUsed
          });

          if (totalCredits < 1) {
            console.log(`User ${userId} has insufficient credits`);
            return res.status(403).json({
              message: "Not enough credits",
              error: "credit_required",
              freeCreditsUsed: !hasMonthlyFreeCredit,
              paidCredits: user.paidCredits,
            });
          }

          console.log(
            `User ${userId} has ${totalCredits} total credits - proceeding with transformation`,
          );
        } catch (userError) {
          console.error("Error checking user credits:", userError);
          return res.status(500).json({
            message: "Error checking user credits",
            error: userError.message
          });
        }
      }

      // Import the transformImage function
      const { transformImage } = await import("./openai-final.js");

      // Perform the image transformation with proper MIME type handling
      console.log(
        `Starting transformation with MIME type checking for ${sourceImagePath}`,
      );
      // --- SIZE SANITIZATION START ---
      let apiSize = imageSize;
      if (!["1024x1024", "1536x1024", "1024x1536", "auto"].includes(apiSize)) {
        apiSize = "1024x1024";
      }
      // --- SIZE SANITIZATION END ---

      const result = await transformImage(sourceImagePath, prompt, apiSize);

      // Create a server-relative path for the transformed image
      const baseUrl = req.protocol + "://" + req.get("host");

      const transformedImagePath = result.transformedPath
        .replace(process.cwd(), "")
        .replace(/^\//, "");
      const transformedImageUrl = `${baseUrl}/${transformedImagePath}`;

      let secondTransformedImageUrl = null;
      if (result.secondTransformedPath) {
        const secondTransformedImagePath = result.secondTransformedPath
          .replace(process.cwd(), "")
          .replace(/^\//, "");
        secondTransformedImageUrl = `${baseUrl}/${secondTransformedImagePath}`;
      }

      // If this is an edit and we have a previous transformation, increment the edits count
      let transformation = null;
      if (userId) {
        try {
          // If it's an edit of a previous transformation, update that record
          if (isEdit && prevTransform) {
            // Update the previous transformation with new info
            transformation = await storage.incrementEditsUsed(
              previousTransformation,
            );

            console.log(
              `Updated transformation ${previousTransformation}, new edits used: ${transformation.editsUsed}`,
            );
          }
          // Otherwise create a new transformation record
          else {
            // Create base transformation object with required fields from schema
            const transformationData = {
              userId,
              originalImagePath: fullImagePath,
              prompt,
            };

            // Create the transformation record
            transformation =
              await storage.createTransformation(transformationData);

            // Then update the transformation with additional fields
            transformation = await storage.updateTransformationStatus(
              transformation.id,
              "completed",
              result.transformedPath,
              undefined, // No error
              result.secondTransformedPath || undefined,
            );

            console.log(
              `Created new transformation record with ID ${transformation.id}`,
            );
          }

          // Update user credits if needed
          // For edits beyond the first one, or for new transformations
          if (
            (isEdit && prevTransform && (prevTransform.editsUsed || 0) > 0) ||
            !isEdit
          ) {
            // Update user credits - deduct after successful transformation
            try {
              const useFreeCredit = !userCredits.freeCreditsUsed;
              const paidCreditsRemaining = useFreeCredit
                ? userCredits.paidCredits
                : Math.max(0, userCredits.paidCredits - 1);

              console.log(`Deducting credit for user ${userId}:`, {
                useFreeCredit,
                currentPaidCredits: userCredits.paidCredits,
                newPaidCredits: paidCreditsRemaining
              });

              await storage.updateUserCredits(
                userId,
                useFreeCredit,
                paidCreditsRemaining,
              );

              console.log(
                `Updated user ${userId} credits - Used free credit: ${useFreeCredit}, Paid credits remaining: ${paidCreditsRemaining}`,
              );
            } catch (creditError) {
              console.error("Error updating user credits:", creditError);
              // Don't fail the transformation if credit update fails
            }
          }
        } catch (dbError) {
          console.error("Error saving transformation to database:", dbError);
          // Continue with the response even if DB operation failed
        }
      }

      // Return the transformed image URL
      res.status(200).json({
        transformedImageUrl,
        secondTransformedImageUrl,
        prompt,
        id: transformation ? transformation.id : null,
        editsUsed: transformation ? transformation.editsUsed : 0,
      });
    } catch (error: any) {
      console.error("Error in image transformation:", error);

      // Check for specific OpenAI error types
      if (
        error.message &&
        (error.message.includes("organization verification") ||
          error.message.includes("invalid_api_key") ||
          error.message.includes("rate limit") ||
          error.message.includes("billing"))
      ) {
        return res.status(400).json({
          message: error.message,
          error: "openai_api_error",
        });
      }

      // Check for content moderation errors
      if (
        error.message &&
        error.message.toLowerCase().includes("content policy")
      ) {
        return res.status(400).json({
          message:
            "Your request was rejected by our content safety system. Please try a different prompt.",
          error: "content_safety",
        });
      }

      // Generic error
      res.status(500).json({
        message: "Error processing image transformation",
        error: error.message,
      });
    }
  });

  // Add a new endpoint for coloring book transformations
  app.post("/api/coloring-book", async (req, res) => {
    try {
      console.log(
        "\n\n====================== COLORING BOOK TRANSFORMATION ======================",
      );
      console.log(`Timestamp: ${new Date().toISOString()}`);

      // Validate request
      const { imagePath, userId } = req.body;

      if (!imagePath) {
        return res.status(400).json({ message: "Image path is required" });
      }

      // Determine full path to image
      const fullImagePath = path.isAbsolute(imagePath)
        ? imagePath
        : path.join(process.cwd(), imagePath);

      console.log(
        `Processing coloring book transformation for image: ${fullImagePath}`,
      );
      console.log(`User ID: ${userId || "Guest"}`);

      // Check if the image exists
      if (!fs.existsSync(fullImagePath)) {
        return res.status(404).json({ message: "Image file not found" });
      }

      // Check if user has credits (if userId is provided)
      let userCredits = { freeCreditsUsed: false, paidCredits: 0 };

      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          // Check if the user has free credits or paid credits
          const hasMonthlyFreeCredit =
            await storage.checkAndResetMonthlyFreeCredit(userId);
          userCredits = {
            freeCreditsUsed: !hasMonthlyFreeCredit,
            paidCredits: user.paidCredits,
          };

          // Simple credit check - user needs either free credit or paid credits
          const totalCredits = (hasMonthlyFreeCredit ? 1 : 0) + user.paidCredits;
          console.log(`Credit check for user ${userId}:`, {
            hasMonthlyFreeCredit,
            paidCredits: user.paidCredits,
            totalCredits,
            freeCreditsUsed: user.freeCreditsUsed
          });

          if (totalCredits < 1) {
            console.log(`User ${userId} has insufficient credits`);
            return res.status(403).json({
              message: "Not enough credits",
              error: "credit_required",
              freeCreditsUsed: !hasMonthlyFreeCredit,
              paidCredits: user.paidCredits,
            });
          }

          console.log(
            `User ${userId} has ${totalCredits} total credits - proceeding with transformation`,
          );
        } catch (userError) {
          console.error("Error checking user credits:", userError);
          return res.status(500).json({
            message: "Error checking user credits",
            error: userError.message
          });
        }
      }

      // Import the OpenAI transformation function
      const { transformToColoringBook } = await import("./openai");

      // Transform the image to coloring book style
      console.log("Calling OpenAI for coloring book transformation...");
      const result = await transformToColoringBook(fullImagePath);
      console.log("Coloring book transformation completed successfully");

      // Get the server URL to construct full URLs for the images
      const baseUrl = req.protocol + "://" + req.get("host");

      // Create the transformed image URL - removing leading slash and prepending the server URL
      const transformedImagePath = result.transformedPath
        .replace(process.cwd(), "")
        .replace(/^\//, "");
      const transformedImageUrl = `${baseUrl}/${transformedImagePath}`;

      // If userId is provided, deduct a credit
      if (userId) {
        try {
          console.log(`Deducting credit for user ${userId}`);

          // Update user credits - always deduct for transformations
          const useFreeCredit = !userCredits.freeCreditsUsed;
          const paidCreditsRemaining = useFreeCredit
            ? userCredits.paidCredits
            : Math.max(0, userCredits.paidCredits - 1);

          await storage.updateUserCredits(
            userId,
            useFreeCredit,
            paidCreditsRemaining,
          );

          console.log(
            `Updated user ${userId} credits - Used free credit: ${useFreeCredit}, Paid credits remaining: ${paidCreditsRemaining}`,
          );
        } catch (creditError) {
          console.error("Error updating user credits:", creditError);
          // Continue with the response even if credit update failed
        }
      }

      // Return the transformed image URL
      res.status(200).json({
        message: "Coloring book transformation completed successfully",
        coloringBookImageUrl: transformedImageUrl,
        originalImagePath: imagePath,
      });
    } catch (error: any) {
      console.error("Error in coloring book transformation:", error);
      res.status(500).json({
        message: "Error processing coloring book transformation",
        error: error.message,
      });
    }
  });

  // Get user credits by ID endpoint (for client compatibility)
  app.get("/api/credits/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({
          paidCredits: 0,
          freeCreditsUsed: false,
          message: "User not found",
        });
      }

      // Check if user has monthly free credit available
      const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userId);

      // Calculate total available credits
      const freeCreditsAvailable = hasMonthlyFreeCredit ? 1 : 0;
      const totalCredits = freeCreditsAvailable + user.paidCredits;

      console.log(`User ${userId} credit check: Free credits used: ${user.freeCreditsUsed}, Has monthly free: ${hasMonthlyFreeCredit}, Paid credits: ${user.paidCredits}, Total available: ${totalCredits}`);

      // Return user credits in the format expected by the client
      return res.json({
        id: user.id,
        freeCreditsUsed: !hasMonthlyFreeCredit,
        paidCredits: user.paidCredits,
        totalCredits: totalCredits,
        credits: totalCredits, // For compatibility
      });
    } catch (error: any) {
      console.error("Error getting user credits by ID:", error);
      return res.status(500).json({
        message: "Error fetching user credits",
        error: error.message,
      });
    }
  });

  // Fix for "user credits" 404. Add a new route for /api/user-credits/:id
  app.get("/api/user-credits/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({
          paidCredits: 0,
          freeCreditsUsed: false,
          message: "User not found",
        });
      }

      // Check if user has monthly free credit available
      const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userId);

      // Calculate total available credits
      const freeCreditsAvailable = hasMonthlyFreeCredit ? 1 : 0;
      const totalCredits = freeCreditsAvailable + user.paidCredits;

      console.log(`User ${userId} user-credits check: Free credits used: ${user.freeCreditsUsed}, Has monthly free: ${hasMonthlyFreeCredit}, Paid credits: ${user.paidCredits}, Total available: ${totalCredits}`);

      return res.json({
        id: user.id,
        freeCreditsUsed: !hasMonthlyFreeCredit,
        paidCredits: user.paidCredits,
        totalCredits: totalCredits,
        credits: totalCredits, // For compatibility
      });
    } catch (error: any) {
      console.error("Error getting user credits by ID:", error);
      return res.status(500).json({
        message: "Error fetching user credits",
        error: error.message,
      });
    }
  });

  // Enhance prompt endpoint
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Import the enhancePrompt function from prompt-service
      const { enhancePrompt } = await import("./prompt-service");

      const enhancedPrompt = await enhancePrompt(prompt);

      res.json({
        originalPrompt: prompt,
        enhancedPrompt,
      });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res
        .status(500)
        .json({ message: "Error enhancing prompt", error: error.message });
    }
  });

  // Configuration endpoint
  app.get("/api/config", (req, res) => {
    // Return JSON with application configuration
    res.json({
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      featureFlags: {
        newUI: true,
        productAiStudio: true, // Add feature flag for the new Product AI Studio feature
      },
    });
  });

  // Debug endpoint for credit troubleshooting
  app.get("/api/debug/credits/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get detailed credit information
      const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userId);
      const freeCreditsAvailable = hasMonthlyFreeCredit ? 1 : 0;
      const totalCredits = freeCreditsAvailable + user.paidCredits;

      return res.json({
        userId: user.id,
        rawUserData: {
          freeCreditsUsed: user.freeCreditsUsed,
          paidCredits: user.paidCredits,
          lastFreeCredit: user.lastFreeCredit,
        },
        calculatedData: {
          hasMonthlyFreeCredit,
          freeCreditsAvailable,
          totalCredits,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error in debug credits endpoint:", error);
      return res.status(500).json({
        message: "Error fetching debug credit information",
        error: error.message,
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  console.log("Server created and routes registered successfully");
  return httpServer;
}