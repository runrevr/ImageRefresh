import { apiRequest } from './queryClient';

export interface SavedImage {
  id: number;
  userId: number;
  imageUrl: string;
  imageType: string;
  category: string;
  originalImagePath?: string;
  isVariant: boolean;
  parentImageId?: number;
  createdAt: string;
}

export class DirectImageService {
  static async getUserImages(userId: number): Promise<SavedImage[]> {
    console.log(`[DIRECT-SERVICE] Fetching images for user ${userId}`);
    
    try {
      // Try the API proxy endpoint first
      const response = await fetch(`/api/user-images/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });

      console.log(`[DIRECT-SERVICE] Response status: ${response.status}`);
      console.log(`[DIRECT-SERVICE] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DIRECT-SERVICE] API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error(`[DIRECT-SERVICE] Invalid content type: ${contentType}`);
        console.error(`[DIRECT-SERVICE] Response text:`, responseText.substring(0, 200));
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();
      console.log(`[DIRECT-SERVICE] Received data:`, data);

      if (data.success && data.images) {
        console.log(`[DIRECT-SERVICE] Successfully fetched ${data.images.length} images`);
        return data.images;
      } else if (Array.isArray(data)) {
        console.log(`[DIRECT-SERVICE] Received array format with ${data.length} images`);
        return data;
      } else {
        console.error(`[DIRECT-SERVICE] Unexpected response format:`, data);
        return [];
      }
      
    } catch (error) {
      console.error('[DIRECT-SERVICE] Error:', error);
      
      // Fallback: try direct API request through query client
      try {
        console.log(`[DIRECT-SERVICE] Trying fallback API request`);
        const fallbackData = await apiRequest(`/api/user-images/${userId}`);
        if (Array.isArray(fallbackData)) {
          return fallbackData;
        } else if (fallbackData?.images && Array.isArray(fallbackData.images)) {
          return fallbackData.images;
        }
      } catch (fallbackError) {
        console.error('[DIRECT-SERVICE] Fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  static async deleteImage(imageId: number): Promise<void> {
    await apiRequest(`/api/user-images/${imageId}`, {
      method: 'DELETE'
    });
  }
}