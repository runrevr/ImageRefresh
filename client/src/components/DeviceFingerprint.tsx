import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * This component generates a device fingerprint and stores it in local storage
 * The fingerprint is sent with API requests to track demo usage
 */
export default function DeviceFingerprint() {
  useEffect(() => {
    // Check if fingerprint already exists
    const fingerprint = localStorage.getItem('device_fingerprint');
    
    if (!fingerprint) {
      // Generate a unique identifier for this device 
      // Using UUID v4 as a simple fingerprint
      const newFingerprint = uuidv4();
      localStorage.setItem('device_fingerprint', newFingerprint);
      console.log('Device fingerprint generated and stored');
    } else {
      console.log('Using existing device fingerprint');
    }
  }, []);

  // This is an invisible component, it doesn't render anything
  return null;
}