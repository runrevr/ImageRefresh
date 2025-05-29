import fs from "fs";
import path from "path";

/**
 * Creates a coloring book style version of an image using GPT-image-01 directly
 * @param imagePath Path to the image to transform
 * @returns Path to the transformed image
 */
export async function createColoringBookImage(imagePath: string): Promise<{ outputPath: string }> {
  try {
    console.log(`Creating coloring book version of image: ${imagePath}`);

    // Generate a unique filename for the output
    const outputFilename = `coloring-book-${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
    const outputDir = path.join(process.cwd(), "uploads");
    const outputPath = path.join(outputDir, outputFilename);

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Simple coloring book transformation prompt
    const coloringBookPrompt = "Transform this into a black and white coloring book page with thick outlines, no colors, no shading, simple line art suitable for children to color";

    console.log("Transforming image with GPT-image-01...");

    // Import and use the GPT-image-01 transformation function
    const { transformImage } = await import("./openai-final.js");
    const result = await transformImage(imagePath, coloringBookPrompt, "1024x1024");

    console.log(`Coloring book image created successfully: ${result.transformedPath}`);

    return { outputPath: result.transformedPath };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in createColoringBookImage:", err);
    throw new Error(`Error creating coloring book image: ${err.message}`);
  }
}