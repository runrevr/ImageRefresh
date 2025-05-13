import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getDeviceFingerprint, addFingerprintToUrl } from "./fingerprint";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Clone response before reading it
    const resClone = res.clone();
    
    // First check the content type to handle HTML errors appropriately
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('text/html')) {
      // For HTML responses, return a more user-friendly error
      throw new Error(`${res.status}: Server error occurred. Please try again later.`);
    }
    
    try {
      // Try to parse as JSON first
      const errorData = await resClone.json();
      throw new Error(errorData.message || `${res.status}: ${errorData.error || 'Unknown error'}`);
    } catch (e) {
      // If JSON parsing fails, fall back to text
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  isFormData: boolean = false,
): Promise<Response> {
  let requestBody: string | FormData | undefined = undefined;
  let headers: Record<string, string> = {};
  
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

  const res = await fetch(url, {
    method,
    headers,
    body: requestBody,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add fingerprint to the URL
    const url = addFingerprintToUrl(queryKey[0] as string);
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
