import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function truncateFilename(filename: string, maxLength = 20) {
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop();
  const name = filename.substring(0, filename.lastIndexOf('.'));
  
  return `${name.substring(0, maxLength - extension.length - 3)}...${extension}`;
}

export function downloadImage(url: string, filename: string) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'transformed-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}

// Function to extract the filename from a path
export function getFilenameFromPath(path: string): string {
  return path.split('/').pop() || 'transformed-image.jpg';
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
