import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Basic text analysis example
export async function analyzeText(text: string): Promise<string> {
  const prompt = `Please analyze the following text and provide insights:\n\n${text || ""}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "";
}

// Structured sentiment analysis with JSON return
export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text || "",
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
    };
  } catch (error: any) {
    throw new Error("Failed to analyze sentiment: " + (error.message || "Unknown error"));
  }
}

// Image analysis for uploaded images
export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image in detail and describe its key elements, context, and any notable aspects."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return visionResponse.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Image analysis failed:", error);
    throw new Error("Failed to analyze image: " + (error.message || "Unknown error"));
  }
}

// Image generation using prompt
export async function generateImage(prompt: string): Promise<{ url: string }> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return { url: response.data?.[0]?.url || "" };
  } catch (error: any) {
    console.error("Image generation failed:", error);
    throw new Error("Failed to generate image: " + (error.message || "Unknown error"));
  }
}

// Image transformation (vision to DALL-E)
export async function transformImage(
  base64Image: string, 
  prompt: string
): Promise<{ url: string }> {
  try {
    // Convert base64 to buffer for the image edit API
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Use GPT-image-01 with the /edits endpoint to modify the original image
    const response = await openai.images.edit({
      model: "gpt-image-01",
      image: imageBuffer,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    
    return { url: response.data?.[0]?.url || "" };
  } catch (error: any) {
    console.error("Image transformation failed:", error);
    throw new Error("Failed to transform image: " + (error.message || "Unknown error"));
  }
}

export default openai;