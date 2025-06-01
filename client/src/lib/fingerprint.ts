
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

export const getDeviceFingerprint = generateFingerprint;

export default generateFingerprint;
