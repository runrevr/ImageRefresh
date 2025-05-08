import { useEffect } from 'react';

/**
 * This component generates a device fingerprint and stores it in local storage
 * The fingerprint is sent with API requests to track demo usage
 */
export default function DeviceFingerprint() {
  useEffect(() => {
    const generateFingerprint = async () => {
      // Check if we already have a fingerprint in localStorage
      const existingFingerprint = localStorage.getItem('device_fingerprint');
      if (existingFingerprint) {
        console.log('Using existing device fingerprint');
        return;
      }

      try {
        // Create a simple fingerprint based on available browser properties
        const components = [];

        // Add user agent
        components.push(navigator.userAgent);

        // Add screen properties
        components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);

        // Add timezone
        components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

        // Add language
        components.push(navigator.language || 'en-US');

        // Add platform
        components.push(navigator.platform || 'unknown');

        // Add enabled plugins count and names
        if (navigator.plugins) {
          components.push(navigator.plugins.length.toString());
          for (let i = 0; i < navigator.plugins.length; i++) {
            components.push(navigator.plugins[i].name);
          }
        }

        // Add canvas fingerprint if available
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw some text with a specific font
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Canvas Fingerprint', 2, 15);
            
            // Use toDataURL to get a serialized version of the canvas
            const dataURL = canvas.toDataURL();
            components.push(dataURL.slice(0, 100)); // Just use the first part to save space
          }
        } catch (err) {
          console.log('Canvas fingerprinting not available');
        }

        // Combine all components and hash them
        const fingerprintString = components.join('|||');
        
        // Create a basic hash of the fingerprint string
        const fingerprint = await createHash(fingerprintString);
        
        // Store in localStorage
        localStorage.setItem('device_fingerprint', fingerprint);
        console.log('Device fingerprint generated and stored');
      } catch (error) {
        console.error('Error generating device fingerprint:', error);
        // Create a fallback random fingerprint
        const fallbackFingerprint = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);
        localStorage.setItem('device_fingerprint', fallbackFingerprint);
      }
    };

    // Helper function to create a hash
    const createHash = async (text: string): Promise<string> => {
      try {
        // Use SubtleCrypto if available (modern browsers)
        if (window.crypto && window.crypto.subtle) {
          const encoder = new TextEncoder();
          const data = encoder.encode(text);
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
          // Fallback for older browsers - simple string manipulation hash
          let hash = 0;
          for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          return hash.toString(36);
        }
      } catch (error) {
        console.error('Error creating hash:', error);
        // Really simple fallback
        return text.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0).toString(36);
      }
    };

    generateFingerprint();
  }, []);

  // This is a "headless" component - it doesn't render anything
  return null;
}