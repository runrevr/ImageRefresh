
import axios from 'axios';

export class AnthropicService {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set. Anthropic API calls will fail.');
    }
  }

  /**
   * Generate a text completion with Claude
   */
  async generateCompletion(prompt: string, options: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  } = {}) {
    const { 
      maxTokens = 1000, 
      temperature = 0.7,
      model = 'claude-3-opus-20240229'
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model,
          max_tokens: maxTokens,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }

  /**
   * Generate an image description
   */
  async analyzeImage(imageUrl: string, prompt: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'url',
                    url: imageUrl
                  }
                },
                {
                  type: 'text',
                  text: prompt || 'Describe this image in detail'
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error analyzing image with Anthropic:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const anthropicService = new AnthropicService();
