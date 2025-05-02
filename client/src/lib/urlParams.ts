/**
 * URL parameter handling utilities
 */

/**
 * Extracts URL query parameters from the current URL
 * @returns {Object} An object with parameter names as keys and values as values
 */
export function getURLParams(): Record<string, string> {
  const urlParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  // Use forEach to avoid iterator issues
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Checks if a URL parameter exists and matches a specific value
 * @param {string} paramName - The name of the parameter to check
 * @param {string} expectedValue - The expected value of the parameter
 * @returns {boolean} - True if the parameter exists and matches the expected value
 */
export function checkURLParam(paramName: string, expectedValue: string): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const paramValue = urlParams.get(paramName);
  
  return paramValue === expectedValue;
}

/**
 * Gets a specific URL parameter value
 * @param {string} paramName - The name of the parameter to get
 * @returns {string|null} - The parameter value or null if not found
 */
export function getURLParam(paramName: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

/**
 * Builds a URL with query parameters
 * @param {string} baseUrl - The base URL without parameters
 * @param {Object} params - Object containing parameter key-value pairs
 * @returns {string} - The complete URL with parameters
 */
export function buildURLWithParams(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl, window.location.origin);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }
  
  return url.toString();
}
