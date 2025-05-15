import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to convert image to base64
function imageToBase64(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString('base64');
}

// Function to find a test image
async function findTestImage() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory not found, checking attached_assets instead');
      const assetsDir = path.join(process.cwd(), 'attached_assets');
      
      if (!fs.existsSync(assetsDir)) {
        console.error('No image directories found');
        return null;
      }
      
      const files = fs.readdirSync(assetsDir);
      const imageFiles = files.filter(file => 
        file.endsWith('.jpg') || 
        file.endsWith('.jpeg') || 
        file.endsWith('.png')
      );
      
      if (imageFiles.length === 0) {
        console.error('No image files found in attached_assets');
        return null;
      }
      
      return path.join(assetsDir, imageFiles[0]);
    }
    
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.png')
    );
    
    if (imageFiles.length === 0) {
      console.error('No image files found in uploads directory');
      return null;
    }
    
    return path.join(uploadsDir, imageFiles[0]);
  } catch (error) {
    console.error('Error finding test image:', error);
    return null;
  }
}

// Transformation test function
async function testTransformation() {
  try {
    // Find a test image
    const imagePath = await findTestImage();
    
    if (!imagePath) {
      console.error('No test image found to use for transformation');
      return;
    }
    
    console.log(`Using test image: ${imagePath}`);
    
    // Convert image to base64
    const base64Image = imageToBase64(imagePath);
    
    // Print information about the image
    console.log(`Image size: ${base64Image.length} bytes`);
    
    // Define prompt for transformation
    const prompt = "Transform this image into a cartoon style with bright colors";
    
    console.log("Sending request to OpenAI for image transformation...");
    console.log("This may take some time depending on the image size and complexity...");
    
    // First analyze the image with vision API
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o", // Use vision model
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analyze this image for transformation with the following style: ${prompt}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });
    
    const analysis = visionResponse.choices[0].message.content;
    console.log("Image analysis complete:");
    console.log(analysis);
    
    // Then generate a transformed image using DALL-E
    const enhancedPrompt = `Based on this image analysis: ${analysis}. 
                           Transform the image with these instructions: ${prompt}`;
    
    console.log("Generating transformed image...");
    const generationResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Get the result
    const result = generationResponse.data[0];
    
    console.log("Transformation complete!");
    console.log("Result URL:", result.url);
    
    // Download the result image
    const response = await fetch(result.url);
    const buffer = await response.arrayBuffer();
    
    // Save the result
    const outputDir = path.join(process.cwd(), 'transformed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const outputPath = path.join(outputDir, `transformed-${Date.now()}.png`);
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    console.log(`Transformed image saved to: ${outputPath}`);
    
  } catch (error) {
    console.error("Error in transformation test:", error);
    
    if (error.response) {
      console.error("OpenAI API Error:");
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

// Run the test
testTransformation();