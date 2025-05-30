import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getDeviceFingerprint, addFingerprintToUrl } from "./fingerprint";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Clone response before reading it
    const resClone = res.clone();
    
    // First check the content type to handle HTML errors appropriately
    const contentType = res.headers.get('content-type');
    
    // Special handling for user credits endpoint to prevent cascading errors
    const isUserCreditsEndpoint = res.url.includes('/api/user/credits');
    if (isUserCreditsEndpoint) {
      console.debug(`Using default credits - response status: ${res.status}`);
      // Return default credits object instead of throwing
      return;
    }
    
    if (contentType && contentType.includes('text/html')) {
      // For HTML responses, give a more detailed error for debugging
      console.error(`Received HTML response instead of JSON. Status: ${res.status}, URL: ${res.url}`);
      // Get a sample of the HTML to help debug
      const htmlSample = await resClone.text().then(text => text.substring(0, 150) + '...');
      console.error(`HTML response sample: ${htmlSample}`);
      // Return user-friendly error
      throw new Error(`${res.status}: Server error occurred. Please try again later.`);
    }
    
    try {
      // Try to parse as JSON first
      const errorData = await resClone.json();
      throw new Error(errorData.message || `${res.status}: ${errorData.error || 'Unknown error'}`);
    } catch (e) {
      // If JSON parsing fails, fall back to text
      const text = (await res.text()) || res.statusText;
      console.error(`Failed to parse response as JSON. Status: ${res.status}, URL: ${res.url}`);
      console.error(`Response text: ${text.substring(0, 150)}...`);
      throw new Error(`${res.status}: ${text.substring(0, 100)}...`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  isFormData: boolean = false,
): Promise<Response> {
  try {
    let requestBody: string | FormData | undefined = undefined;
    let headers: Record<string, string> = {};
    
    // Special handling for credits endpoint
    const isUserCreditsEndpoint = url.includes('/api/user/credits');
    // Check if this is a transform endpoint (special handling for 502 errors)
    const isTransformEndpoint = url.includes('/api/transform');
    
    // Add fingerprint to the URL for GET requests
    if (method.toUpperCase() === 'GET' || !data) {
      url = addFingerprintToUrl(url);
    }
  
    // Process request body based on data type
    if (data) {
      if (isFormData) {
        // Handle FormData
        if (data instanceof FormData) {
          // Use the FormData as is
          requestBody = data;
          // FormData already includes the necessary Content-Type header
          data.append('fingerprint', getDeviceFingerprint() || '');
        } else {
          console.error('Data was specified as FormData but is not a FormData instance');
          throw new Error('Invalid FormData');
        }
      } else {
        // Handle JSON data
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify({
          ...data as Record<string, any>,
          fingerprint: getDeviceFingerprint()
        });
      }
    }
  
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: requestBody,
        credentials: "include",
      });
      
      // Special handling for credits endpoint
      if (isUserCreditsEndpoint && !res.ok) {
        console.debug(`Using default credits values - response status: ${res.status}`);
        const mockResponse = new Response(JSON.stringify({
          credits: 0,
          paidCredits: 0,
          freeCreditsUsed: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        return mockResponse;
      }
    
      await throwIfResNotOk(res);
      return res;
    } catch (fetchError: any) {
      console.error(`Fetch error for ${url}:`, fetchError);
      
      // Handle common connectivity errors
      if (fetchError.message && (
          fetchError.message.includes("Failed to fetch") || 
          fetchError.message.includes("Network Error") || 
          fetchError.message.includes("502 Bad Gateway"))) {
        console.error("Network connectivity issue detected");
        
        // For transformation endpoint (critical feature), throw a more specific error
        if (isTransformEndpoint) {
          throw new Error("Server connection error. The server may be temporarily unavailable. Please try again in a few minutes.");
        }
      }
      
      throw fetchError;
    }
  } catch (error) {
    // If this is the credits endpoint, return a mock response to prevent UI errors
    if (url.includes('/api/user/credits')) {
      console.debug("Using default credits values - API request error");
      return new Response(JSON.stringify({
        credits: 0,
        paidCredits: 0,
        freeCreditsUsed: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add fingerprint to the URL
    const url = addFingerprintToUrl(queryKey[0] as string);
    
    // Special handling for user credits endpoint
    const isUserCreditsEndpoint = url.includes('/api/user/credits');
    const isTransformationEndpoint = url.includes('/api/transformation/');
    
    try {
      const res = await fetch(url, {
        credentials: "include",
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
  
      // For credits endpoint, handle any error by returning default credits
      if (isUserCreditsEndpoint && !res.ok) {
        console.debug(`Using default credits values - response status: ${res.status}`);
        return {
          credits: 0,
          paidCredits: 0,
          freeCreditsUsed: true
        };
      }
      
      // Handle 502 errors gracefully for transformation status checks
      if (isTransformationEndpoint && res.status === 502) {
        console.error("Server unavailable (502) when checking transformation status");
        // Return a special error object that the UI can handle
        return {
          error: "server_unavailable",
          message: "Server is temporarily unavailable. Please try again in a few minutes.",
          status: 502
        };
      }
  
      await throwIfResNotOk(res);
      
      try {
        return await res.json();
      } catch (jsonError) {
        if (isUserCreditsEndpoint) {
          console.debug("Using default credits values - JSON parse error");
          return {
            credits: 0,
            paidCredits: 0,
            freeCreditsUsed: true
          };
        }
        throw jsonError;
      }
    } catch (fetchError: any) {
      if (isUserCreditsEndpoint) {
        // If not logged in, this is expected - just use default values
        // Don't log as error as it fills the console with misleading messages
        console.debug("Using default credits values - not logged in or API error");
        return {
          credits: 0,
          paidCredits: 0,
          freeCreditsUsed: true
        };
      }
      
      // Look for network connectivity errors
      if (fetchError.message && (
          fetchError.message.includes("Failed to fetch") || 
          fetchError.message.includes("Network Error") || 
          fetchError.message.includes("502"))) {
        console.error(`Network connectivity error for ${url}:`, fetchError.message);
        
        // Return a special object for connection errors that UI can handle
        return {
          error: "server_unavailable",
          message: "Server is temporarily unavailable. Please try again in a few minutes.",
          status: 502
        };
      }
      
      throw fetchError;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
