
export const sizeOptions = [
  { value: "512x512", label: "512×512", description: "Small Square", category: "square" },
  { value: "768x768", label: "768×768", description: "Medium Square", category: "square" },
  { value: "1024x1024", label: "1024×1024", description: "Large Square", category: "square" },
  { value: "2048x2048", label: "2048×2048", description: "XL Square", category: "square" },
  { value: "1280x720", label: "1280×720", description: "HD Landscape", category: "landscape" },
  { value: "1536x1024", label: "1536×1024", description: "3:2 Landscape", category: "landscape" },
  { value: "1920x1080", label: "1920×1080", description: "Full HD Landscape", category: "landscape" },
  { value: "1600x900", label: "1600×900", description: "16:9 Medium", category: "landscape" },
  { value: "1024x1536", label: "1024×1536", description: "2:3 Portrait", category: "portrait" },
  { value: "1080x1920", label: "1080×1920", description: "Full HD Portrait", category: "portrait" },
  { value: "900x1600", label: "900×1600", description: "9:16 Medium", category: "portrait" }
] as const;

export type SizeOption = typeof sizeOptions[number]['value'];

export function mapToOpenAISize(requestedSize: string): string {
  const openaiSizes = ["1024x1024", "1536x1024", "1024x1536"];
  if (openaiSizes.includes(requestedSize)) return requestedSize;
  
  const [width, height] = requestedSize.split('x').map(Number);
  const aspectRatio = width / height;
  
  if (aspectRatio > 1.4) return "1536x1024";
  if (aspectRatio < 0.7) return "1024x1536";
  return "1024x1024";
}
