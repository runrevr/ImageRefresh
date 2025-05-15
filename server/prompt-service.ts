import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhances a user's prompt with AI assistance
 * 
 * @param prompt The original user prompt
 * @returns Enhanced prompt with more details
 */
export async function enhancePrompt(prompt: string): Promise<string> {
  try {
    // Guard against empty prompts
    if (!prompt || prompt.trim().length === 0) {
      return prompt;
    }

    console.log(`Enhancing prompt: ${prompt}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use the latest model
      messages: [
        {
          role: "system",
          content: `You are an expert prompt engineer that helps enhance image transformation prompts for OpenAI DALL-E.
            Your task is to enhance the user's prompt by adding details, while keeping the original intent.
            You should NOT add anything that contradicts the original intent.
            NEVER change the style or category of transformation requested.
            Keep your response ONLY to the enhanced prompt text with no explanations.`
        },
        {
          role: "user", 
          content: `Please enhance this image transformation prompt: "${prompt}"`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const enhancedPrompt = response.choices[0]?.message?.content?.trim() || prompt;
    
    console.log(`Enhanced prompt: ${enhancedPrompt}`);
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    // If there's an error, return the original prompt
    return prompt;
  }
}