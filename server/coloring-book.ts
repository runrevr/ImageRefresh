import fs from "fs";
import path from "path";

/**
 * Creates a coloring book style version of an image using GPT-image-01 directly
 * @param imagePath Path to the image to transform
 * @returns Path to the transformed image
 */
export async function createColoringBookImage(
  imagePath: string,
): Promise<{ outputPath: string }> {
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
    const coloringBookPrompt =
      "Transform this image into a professional coloring book style illustration with these specific requirements:\n\n1. Line art conversion:\n   - Convert to pure black outlines on white background\n   - Create clean, smooth, continuous lines\n   - Line thickness should be consistent and bold enough for coloring\n   - Remove all colors, shading, and fills - outlines only\n   - Ensure all shapes are fully enclosed for easy coloring\n\n2. Detail level:\n   - Simplify complex textures into drawable patterns\n   - Convert gradients and shadows into distinct outlined areas\n   - Break down complicated elements into clear, colorable sections\n   - Add decorative patterns where appropriate (hair, clothing, backgrounds)\n   - Include enough detail to be interesting but not overwhelming\n\n3. Composition:\n   - Maintain the original composition and all subjects\n   - Ensure all elements are clearly defined and separated\n   - Add simple background elements if original background is plain\n   - Create distinct boundaries between different areas\n   - Keep proportions accurate to original image\n\n**CRITICAL REQUIREMENTS:**\n- Output must be pure black lines on white background\n- NO grayscale, NO shading, NO filled areas\n- All lines must connect properly to create enclosed spaces\n- Line weight should be uniform and suitable for coloring\n- Maintain recognizable features of all subjects\n- Suitable for both children and adults to color\n- Clear, crisp lines without sketchy or rough edges\n\n**ABSOLUTELY DO NOT:**\n- Include any colors or gray tones\n- Leave any areas filled in or shaded\n- Create lines too thin or too thick for coloring\n- Make it too complex or too simple\n- Lose important details from the original\n- Add realistic shading or gradients\n- Leave open gaps in outline shapes";

    console.log("Transforming image with GPT-image-01...");

    // Import and use the GPT-image-01 transformation function
    const { transformImage } = await import("./openai-final.js");
    const result = await transformImage(
      imagePath,
      coloringBookPrompt,
      "1024x1024",
    );

    console.log(
      `Coloring book image created successfully: ${result.transformedPath}`,
    );

    return { outputPath: result.transformedPath };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in createColoringBookImage:", err);
    throw new Error(`Error creating coloring book image: ${err.message}`);
  }
}
