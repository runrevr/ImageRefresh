import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format bytes to a human-readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Extract filename from a path
 */
export function getFilenameFromPath(path: string): string {
  if (!path) return '';
  // Extract the filename from the path
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Download an image from a URL
 */
export function downloadImage(url: string, filename: string): void {
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}