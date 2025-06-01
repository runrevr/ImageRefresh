
// Device fingerprinting utility
export const generateFingerprint = (): string => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return 'server-' + Math.random().toString(36).substr(2, 9);
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown'
  ];

  // Create a simple hash from the components
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
};

/**
 * Get the device fingerprint from localStorage or generate one
 * @returns The fingerprint string or undefined if not available
 */
export function getDeviceFingerprint(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  let fingerprint = localStorage.getItem('device_fingerprint');
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    localStorage.setItem('device_fingerprint', fingerprint);
  }
  return fingerprint;
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

export default generateFingerprint;
