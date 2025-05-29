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

    // Professional coloring book transformation prompt
    const coloringBookPrompt = "Transform this image into a clean coloring book page with pure black outlines on a white background. Convert all elements into simple line art with clear defined borders suitable for coloring. Remove all shading colors and textures leaving only the outline contours of every shape object and detail. Use consistent line weight throughout with slightly thicker lines for main subjects and thinner lines for fine details. Simplify complex textures into basic patterns or leave them as empty spaces. Ensure all areas are fully enclosed with no gaps in the lines creating distinct sections that can be colored in. Convert any text to outline form. Remove all backgrounds and replace with pure white. The final image should look like a professional coloring book page with crisp black lines ready for coloring with no gray areas or partial shading just pure black and white line art.";

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