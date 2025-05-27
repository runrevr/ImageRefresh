import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from "openai";

config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Define a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Add /api/generate-images endpoint for text-to-image functionality using gpt-image-1
app.post('/api/generate-images', async (req, res) => {
  try {
    const { prompt, width = 512, height = 512 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // For text-to-image generation with gpt-image-1, we need a base image
    // Create a simple white canvas as the base image
    const fs = (await import('fs')).default;
    const path = (await import('path')).default;
    const sharp = (await import('sharp')).default;

    // Create a white canvas as base image
    const timestamp = Date.now();
    const baseImagePath = path.join(process.cwd(), 'uploads', `base-${timestamp}.png`);

    await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .png()
      .toFile(baseImagePath);
    
    const image_generation_response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: `${width}x${height}`,
      response_format: "b64_json",
    });

    const base64ImageData = image_generation_response.data.data[0].b64_json;

    if (!base64ImageData) {
        return res.status(500).json({ error: "Failed to generate image" });
    }
    
    // Convert base64 to image
    const buffer = Buffer.from(base64ImageData, "base64");

    // Return image
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buffer.length
    });
    res.end(buffer);

  } catch (error: any) {
    console.error("Image generation error", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});