import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import fetch from "node-fetch";
import { Readable } from "stream";
import { promisify } from "util";
import stream from "stream";
import axios from "axios";

const pipeline = promisify(stream.pipeline);

// N8N webhook URL
const WEBHOOK_URL = "https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9";

/**
 * Saves an image from a URL to the local filesystem
 */
async function saveImageFromUrl(imageUrl: string, destinationPath: string): Promise<void> {
  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Download and save the image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Error downloading image: ${response.statusText}`);
  }

  const fileStream = createWriteStream(destinationPath);
  if (response.body instanceof Readable) {
    await pipeline(response.body, fileStream);
  } else {
    throw new Error("Response body is not a readable stream");
  }
}

/**
 * Creates a coloring book style version of an image using the N8N webhook
 * @param imagePath Path to the image to transform
 * @returns Path to the transformed image
 */
export async function createColoringBookImage(imagePath: string): Promise<{ outputPath: string }> {
  try {
    console.log(`Creating coloring book version of image: ${imagePath}`);
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    
    // Generate a unique filename for the output
    const outputFilename = `coloring-book-${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
    const outputDir = path.join(process.cwd(), "uploads");
    const outputPath = path.join(outputDir, outputFilename);
    
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Coloring book transformation prompt
    const coloringBookPrompt = "Turn this into a black and white coloring book page. Use only thick black outlines on a white background. Remove all colors and details. Create simple line art with bold borders between sections. No shading, no gradients, no gray areas. Make it look like a children's coloring book with clear, easy-to-color sections.";
    
    // Send the request to the webhook
    console.log("Sending coloring book transformation request to N8N webhook");
    
    // Send a single image with the coloring book transformation request
    const response = await axios.post(WEBHOOK_URL, {
      images: [
        {
          image: base64Image,
          transformations: [
            {
              name: "Coloring Book Style",
              prompt: coloringBookPrompt
            }
          ]
        }
      ],
      industry: "Coloring Book Creation"
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000, // 30 second timeout
      validateStatus: function (status) {
        return status >= 200 && status < 600; // Accept all status codes to handle errors ourselves
      }
    });
    
    // Check for webhook error response
    if (response.status >= 400) {
      console.error(`N8N webhook error: ${response.status} ${response.statusText}`);
      console.error("Webhook error response:", response.data);
      throw new Error(`Webhook returned error status: ${response.status}`);
    }
    
    // Validate the response
    if (!response.data || !response.data.results || !response.data.results[0] || !response.data.results[0].imageUrl) {
      console.error("Invalid response from webhook:", response.data);
      throw new Error("Webhook did not return a valid transformed image");
    }
    
    // Save the transformed image
    const imageUrl = response.data.results[0].imageUrl;
    await saveImageFromUrl(imageUrl, outputPath);
    
    console.log(`Coloring book image saved to: ${outputPath}`);
    
    return { outputPath };
  } catch (error: unknown) {
    const err = error as Error & { 
      response?: { status?: number; data?: any; }; 
      code?: string;
      path?: string;
    };
    
    console.error("Error in createColoringBookImage:", err);
    
    // Check for axios response errors
    if (err.response) {
      console.error(`Webhook returned status: ${err.response.status}`);
      console.error("Webhook response data:", err.response.data);
      
      if (err.response.status === 429) {
        throw new Error("Webhook rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`Webhook error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    }
    
    // For image reading or file system errors
    if (err.code === 'ENOENT') {
      console.error("File not found:", err.path);
      throw new Error(`File not found: ${err.path}`);
    }
    
    throw new Error(`Error creating coloring book image: ${err.message}`);
  }
}