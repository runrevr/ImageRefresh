/**
 * Get the device fingerprint from localStorage
 * @returns The fingerprint string or undefined if not available
 */
export function getDeviceFingerprint(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('device_fingerprint') || undefined;
}

/**
 * Add the device fingerprint to an API request
 * @param data The original request data object
 * @returns The data object with the fingerprint added
 */
export function addFingerprintToRequest<T extends Record<string, any>>(data: T): T & { fingerprint?: string } {
  const fingerprint = getDeviceFingerprint();
  if (!fingerprint) return data;
  
  return {
    ...data,
    fingerprint
  };
}

/**
 * Add the fingerprint as a query parameter to a URL
 * @param url The original URL
 * @returns The URL with the fingerprint query parameter added
 */
export function addFingerprintToUrl(url: string): string {
  const fingerprint = getDeviceFingerprint();
  if (!fingerprint) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}fingerprint=${encodeURIComponent(fingerprint)}`;
}