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

    // Log all API requests
    if (req.originalUrl.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    }

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

  // Authentication middleware for development
  const simpleAuth = (req: Request, res: Response, next: NextFunction) => {
    // For development, simulate authentication
    // In production, this would check actual session/token
    const userId = req.headers['x-user-id'] || req.query.userId || '6';
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Add user to request object
    req.user = { id: parseInt(userId as string, 10) } as any;
    next();
  };

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
      const { originalImagePath, prompt, imageSize, isEdit, previousTransformation } = req.body;
      let { userId } = req.body;

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

      // Log user ID extraction for debugging
      console.log(`[TRANSFORM] User ID extraction:`, {
        bodyUserId: req.body.userId,
        headerUserId: req.headers['x-user-id'],
        reqUserId: req.user?.id,
        finalUserId: userId,
        userIdType: typeof userId
      });

      // Convert string to number if needed
      if (userId && typeof userId === 'string') {
        const numericUserId = parseInt(userId, 10);
        if (!isNaN(numericUserId) && numericUserId > 0) {
          userId = numericUserId;
          console.log(`[TRANSFORM] Converted string userId to number: ${userId}`);
        } else {
          console.error(`[TRANSFORM] Invalid string userId could not be converted: ${userId}`);
          userId = null;
        }
      }
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
          // Continue without credit check if database is unavailable
          console.log("Continuing transformation without credit verification due to database error");
          userCredits = { freeCreditsUsed: false, paidCredits: 1 };
        }
      }

      // Perform the image transformation with proper MIME type handling
      console.log(
        `Starting transformation with MIME type checking for ${sourceImagePath}`,
      );
      // --- SIZE SANITIZATION START ---
      let apiSize = imageSize;
      // Update size validation to include the three valid GPT-image-1 sizes
      if (!["1024x1024", "1792x1024", "1024x1792", "1536x1024", "1024x1536", "auto"].includes(apiSize)) {
        apiSize = "1024x1024";
      }
      // Map legacy sizes to new valid sizes for GPT-image-1
      if (apiSize === "1536x1024") apiSize = "1792x1024";
      if (apiSize === "1024x1536") apiSize = "1024x1792";
      // --- SIZE SANITIZATION END ---

      // Enhance edit prompts with face preservation instructions
      let enhancedPrompt = prompt;
      if (isEdit) {
        enhancedPrompt = `${prompt}

IMPORTANT: Preserve the original face, facial features, skin tone, age, and identity from the image exactly as they appear. Only modify the requested elements (clothing, background, objects, etc.) while keeping all facial characteristics, expressions, and proportions completely unchanged. Do not alter the person's appearance, age, or any facial attributes.`;
        console.log(`Enhanced edit prompt with face preservation: ${enhancedPrompt}`);
      }

      // Import the transformImage function
      const { transformImage } = await import("./openai-final.js");
      const result = await transformImage(sourceImagePath, enhancedPrompt, apiSize);

      // Create a server-relative path for the transformed image
      const baseUrl = req.protocol + "://" + req.get("host");

      const transformedImagePath = result.transformedPath
        .replace(process.cwd(), "")
        .replace(/^\//, "");
      const transformedImageUrl = `${baseUrl}/${transformedImagePath}`;

      // Handle multiple transformed images
      const transformedImageUrls = [];
      let secondTransformedImageUrl = null;

      // Add the primary image
      transformedImageUrls.push(transformedImageUrl);

      // Add the second image if it exists
      if (result.secondTransformedPath) {
        const secondTransformedImagePath = result.secondTransformedPath
          .replace(process.cwd(), "")
          .replace(/^\//, "");
        secondTransformedImageUrl = `${baseUrl}/${secondTransformedImagePath}`;
        transformedImageUrls.push(secondTransformedImageUrl);
      }

      console.log(`[TRANSFORM] Final response will include ${transformedImageUrls.length} image URLs:`, transformedImageUrls);

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

      // Save the transformed image to user's collection
      if (userId && transformedImageUrl) {
        try {
          // Calculate expiry date (45 days from now)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 45);

          // Determine the transformation type for categorization
          let transformationType = 'enhancement';
          if (isEdit) {
            transformationType = 'edit';
          } else if (prompt.toLowerCase().includes('background')) {
            transformationType = 'background_change';
          } else if (prompt.toLowerCase().includes('style')) {
            transformationType = 'style_transfer';
          }

          // Determine category based on the transformation type
          const category = transformationType.includes('product') || 
                          prompt.toLowerCase().includes('product') || 
                          prompt.toLowerCase().includes('e-commerce') || 
                          prompt.toLowerCase().includes('catalog') ? 'product' : 'personal';

          // Save the primary transformed image
          await storage.saveUserImage({
            userId: userId,
            imagePath: result.transformedPath,
            imageUrl: transformedImageUrl,
            imageType: transformationType,
            category: category,
            originalPrompt: prompt,
            transformationId: transformation ? transformation.id : null,
            originalImagePath: originalImagePath,
            expiresAt
          });

          // Save the second transformed image if it exists
          if (secondTransformedImageUrl && result.secondTransformedPath) {
            await storage.saveUserImage({
              userId: userId,
              imagePath: result.secondTransformedPath,
              imageUrl: secondTransformedImageUrl,
              imageType: `${transformationType}_variant`,
              category: category,
              originalPrompt: prompt,
              transformationId: transformation ? transformation.id : null,
              originalImagePath: originalImagePath,
              isVariant: true,
              expiresAt
            });
          }

          console.log(`Saved transformed image(s) to user ${userId}'s collection`);
        } catch (saveError) {
          console.error("Error saving image to user collection:", saveError);
          // Don't fail the transformation if saving to collection fails
        }
      }

      // Return the transformed image URLs
      res.status(200).json({
        transformedImageUrl,
        transformedImageUrls, // Array of all image URLs
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
  app.post("/api/product-enhancement/coloring-book", async (req, res) => {
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

      // Handle URL vs file path
      let sourceImagePath;
      const isUrl = imagePath.startsWith('http');

      if (isUrl) {
        console.log(`Image is a URL, downloading first`);
        // Download the image from the URL
        try {
          const tempFile = path.join(process.cwd(), 'temp', `coloring-downloaded-${Date.now()}.png`);
          const tempDir = path.dirname(tempFile);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          const imgResponse = await axios.get(imagePath, { responseType: 'arraybuffer' });
          fs.writeFileSync(tempFile, Buffer.from(imgResponse.data));
          sourceImagePath = tempFile;
          console.log(`Downloaded image to ${sourceImagePath}`);
        } catch (downloadError) {
          console.error(`Error downloading image from URL: ${downloadError.message}`);
          return res.status(404).json({ message: "Failed to download image from URL" });
        }
      } else {
        // It's a regular file path
        sourceImagePath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
      }

      console.log(`Processing coloring book transformation for image: ${sourceImagePath}`);
      console.log(`User ID: ${userId || "Guest"}`);

      // Check if the image exists
      if (!fs.existsSync(sourceImagePath)) {
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

      // Use the updated coloring book service
      const { createColoringBookImage } = await import("./coloring-book");

      // Transform the image to coloring book style
      console.log("Calling GPT-image-01 for coloring book transformation...");
      const result = await createColoringBookImage(sourceImagePath);
      console.log("Coloring book transformation completed successfully");

      // Get the server URL to construct full URLs for the images
      const baseUrl = req.protocol + "://" + req.get("host");

      // Create the transformed image URL - removing leading slash and prepending the server URL
      const transformedImagePath = result.outputPath
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

      // Save the transformed image to user's collection
      if (userId && transformedImageUrl) {
        try {
          // Calculate expiry date (45 days from now)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 45);

          // Save the coloring book transformation
          await storage.saveUserImage({
            userId: userId,
            imagePath: result.outputPath,
            imageUrl: transformedImageUrl,
            imageType: 'coloring_book',
            originalPrompt: 'Convert to coloring book style',
            transformationId: null,
            expiresAt
          });

          console.log(`Saved coloring book image to user ${userId}'s collection`);
        } catch (saveError) {
          console.error("Error saving coloring book image to user collection:", saveError);
          // Don't fail the transformation if saving to collection fails
        }
      }

      // Return the transformed image URL
      res.status(200).json({
        message: "Coloring book transformation completed successfully",
        transformedImageUrl: transformedImageUrl,
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



  // Credit deduction endpoint
app.post("/api/credits/deduct", async (req, res) => {
  try {
    const { userId, amount = 1, type = 'transformation' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    let user;
    if (userId === 'guest') {
      // Handle guest user credits (stored by fingerprint)
      const fingerprint = req.query.fingerprint || req.headers['x-fingerprint'];
      if (!fingerprint) {
        return res.status(400).json({ error: "Fingerprint required for guest user" });
      }

      // Assuming 'db' is your database client instance
      const guestUsers = await storage.getGuestUsers();
      user = guestUsers.find(guest => guest.fingerprint === fingerprint);

      if (!user) {
        return res.status(404).json({ error: "Guest user not found" });
      }
    } else {
      user = await storage.getUser(parseInt(userId));

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    }

    // Check if user has sufficient credits
    let totalCredits;
    let freeCredits;
    let paidCredits;

    // Check if user has monthly free credit available
    const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(parseInt(userId));
    if (userId === 'guest') {
        totalCredits = 1; // Guest user total credits
        freeCredits = 1;
        paidCredits = 0;
    }
    else {
        freeCredits = hasMonthlyFreeCredit ? 1 : 0;
        paidCredits = user.paidCredits;
        totalCredits = freeCredits + paidCredits;
    }

    if (totalCredits < amount) {
      return res.status(400).json({ error: "Insufficient credits" });
    }

    // Deduct credits (prioritize free credits first)
    let updatedFreeCredits = freeCredits;
    let updatedPaidCredits = paidCredits;
    let remainingToDeduct = amount;

    if (updatedFreeCredits > 0) {
      const deductFromFree = Math.min(updatedFreeCredits, remainingToDeduct);
      updatedFreeCredits -= deductFromFree;
      remainingToDeduct -= deductFromFree;
    }

    if (remainingToDeduct > 0) {
      updatedPaidCredits -= remainingToDeduct;
    }

    // Update user in database
      if (userId !== 'guest') {
          await storage.updateUserCredits(
              parseInt(userId),
              updatedFreeCredits === 0,
              updatedPaidCredits,
          );
      }


    // Record the transaction
    // Note: No direct transaction recording available in the provided storage interface

    res.json({
      success: true,
      credits: {        free: updatedFreeCredits,
        paid: updatedPaidCredits,
        total: updatedFreeCredits + updatedPaidCredits
      },
      deducted: amount
    });

  } catch (error) {
    console.error("Credit deduction error:", error);
    res.status(500).json({ error: "Failed to deduct credits" });
}
});

  // Enhanced credits endpoint with guest support
  app.get("/api/credits/:userIdOrGuest", async (req, res) => {
    try {
      const userIdOrGuest = req.params.userIdOrGuest;

      // If it's 'guest', return guest credits
      if (userIdOrGuest === 'guest') {
        const response = {
          id: null,
          freeCreditsUsed: false,
          paidCredits: 0,
          totalCredits: 1,
          hasMonthlyFreeCredit: true
        };
        return res.json(response);
      }

      // Otherwise treat it as a user ID
      const userId = parseInt(userIdOrGuest);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user gets a free credit this month
      const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userId);
      const totalCredits = (hasMonthlyFreeCredit ? 1 : 0) + user.paidCredits;

      console.log(`User ${userId} credit check: Free credits used: ${user.freeCreditsUsed}, Has monthly free: ${hasMonthlyFreeCredit}, Paid credits: ${user.paidCredits}, Total available: ${totalCredits}`);

      const response = {
        id: user.id,
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits,
        totalCredits: totalCredits,
        hasMonthlyFreeCredit
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ error: 'Failed to fetch credits' });
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
        });      }

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

  // Import prebuilt prompts functions
  const { getPrebuiltPrompts, transformWithPrebuiltPrompt } = await import('./routes/prebuilt-prompts');

  // Prebuilt prompts endpoints
  app.get('/api/prebuilt-prompts', getPrebuiltPrompts);
  app.post('/api/prebuilt-transform', transformWithPrebuiltPrompt);

  // PRIORITY: User images endpoint - must be early in route order
  app.get('/api/user-images/:userId', async (req: Request, res: Response) => {
    console.log(`[USER-IMAGES] Direct hit: ${req.method} ${req.originalUrl}`);
    
    // Force JSON response with strict headers
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      const userIdParam = req.params.userId;
      const userId = parseInt(userIdParam, 10);

      console.log(`[USER-IMAGES] Processing userId: "${userIdParam}" -> ${userId}`);

      if (isNaN(userId) || userId <= 0) {
        console.log(`[USER-IMAGES] Invalid userId, returning 400`);
        return res.status(400).json({ 
          success: false,
          error: 'Invalid user ID',
          received: userIdParam,
          parsed: userId
        });
      }

      console.log(`[USER-IMAGES] Calling storage.getUserImages(${userId})`);
      const images = await storage.getUserImages(userId);
      console.log(`[USER-IMAGES] Storage returned ${images.length} images`);

      const jsonResponse = {
        success: true,
        count: images.length,
        userId: userId,
        images: images,
        timestamp: new Date().toISOString()
      };

      console.log(`[USER-IMAGES] Returning JSON with ${images.length} images`);
      return res.status(200).json(jsonResponse);
      
    } catch (error) {
      console.error('[USER-IMAGES] Error:', error);
      const errorResponse = {
        success: false,
        error: 'Failed to fetch user images',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      return res.status(500).json(errorResponse);
    }
  });

  app.post('/api/user-images', async (req, res) => {
    try {
      const { userId, imagePath, imageUrl, prompt, transformationType } = req.body;

      if (!userId || !imagePath || !imageUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Calculate expiry date (45 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 45);

      const userImage = await storage.saveUserImage({
        userId: parseInt(userId, 10),
        imagePath,
        imageUrl,
        imageType: transformationType || 'enhancement',
        originalPrompt: prompt || null,
        expiresAt
      });

      res.status(201).json(userImage);
    } catch (error) {
      console.error('Error saving user image:', error);
      res.status(500).json({ error: 'Failed to save user image' });
    }
  });

  app.delete('/api/user-images/:imageId/:userId', async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId, 10);
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(imageId) || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid image or user ID' });
      }

      const deleted = await storage.deleteUserImage(imageId, userId);

      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Image not found or not authorized' });
      }
    } catch (error) {
      console.error('Error deleting user image:', error);
      res.status(500).json({ error: 'Failed to delete user image' });
    }
  });

  // Text-to-image generation endpoint
  app.post('/api/generate-images', async (req, res) => {
    try {
      console.log('Request Body:', req.body);
      console.log('[API] Text-to-image generation request received');

      const { prompt, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      // Map aspect ratio to size
      let size = "1024x1024"; // default
      if (aspectRatio === "wide") {
        size = "1792x1024";
      } else if (aspectRatio === "portrait") {
        size = "1024x1792";
      }

      // Enhance the prompt based on context
      let enhancedPrompt = prompt;

      // Use the dedicated OpenAI text-to-image generation service
      const { generateTextToImage } = await import('./openai-text-to-image.js');

      console.log('[API] Successfully imported generateTextToImage function');

      const result = await generateTextToImage(enhancedPrompt, {
        size,
        quality: 'standard',
        style: 'natural'
      });

      // Generate a job ID for tracking
      const jobId = `txt2img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Return the result with metadata
      res.json({
        success: true,
        jobId,
        imageUrl: result.imageUrls[0], // First image URL
        imageUrls: result.imageUrls, // All image URLs
        metadata: {
          prompt: enhancedPrompt,
          aspectRatio
        }
      });

    } catch (error: any) {
      console.error('[API] Text-to-image generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate image'
      });
    }
  });

  // Enhanced image management routes with Personal/Product categorization
  app.get("/api/user/images", simpleAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const category = req.query.category as string;
      
      if (category === 'categorized') {
        // Return images organized by category
        const categorizedImages = await storage.getUserImagesByCategory(userId);
        res.json(categorizedImages);
      } else {
        // Return all images or filtered by specific category
        const images = await storage.getUserImages(userId, category);
        res.json(images);
      }
    } catch (error) {
      console.error("Error fetching user images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  // Delete user image with authentication
  app.delete("/api/user/images/:imageId", simpleAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const imageId = parseInt(req.params.imageId);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ error: "Invalid image ID" });
      }
      
      const deleted = await storage.deleteUserImage(imageId, userId);
      
      if (deleted) {
        res.json({ success: true, message: "Image deleted successfully" });
      } else {
        res.status(404).json({ error: "Image not found or unauthorized" });
      }
    } catch (error) {
      console.error("Error deleting user image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Get single user image for download/sharing
  app.get("/api/user/images/:imageId", simpleAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const imageId = parseInt(req.params.imageId);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ error: "Invalid image ID" });
      }
      
      const images = await storage.getUserImages(userId);
      const image = images.find(img => img.id === imageId);
      
      if (!image) {
        return res.status(404).json({ error: "Image not found or unauthorized" });
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error fetching user image:", error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  // Cleanup expired images (45-day retention)
  app.post("/api/admin/cleanup-expired-images", simpleAuth, async (req: Request, res: Response) => {
    try {
      // Only allow admin users to run cleanup
      const user = req.user!;
      if (user.username !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const deletedCount = await storage.deleteExpiredImages();
      res.json({ 
        success: true, 
        message: `Cleaned up ${deletedCount} expired images`,
        deletedCount 
      });
    } catch (error) {
      console.error("Error cleaning up expired images:", error);
      res.status(500).json({ error: "Failed to cleanup expired images" });
    }
  });

  const server = createServer(app);
  return server;
}