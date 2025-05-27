
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SizeSelectorProps {
  selectedSize: string;
  onSizeChange: (size: string) => void;
  className?: string;
}

const sizeOptions = [
  { 
    value: "512x512", 
    label: "512×512", 
    description: "Small Square",
    category: "square"
  },
  { 
    value: "768x768", 
    label: "768×768", 
    description: "Medium Square",
    category: "square"
  },
  { 
    value: "1024x1024", 
    label: "1024×1024", 
    description: "Large Square",
    category: "square"
  },
  { 
    value: "2048x2048", 
    label: "2048×2048", 
    description: "XL Square",
    category: "square"
  },
  { 
    value: "1280x720", 
    label: "1280×720", 
    description: "HD Landscape",
    category: "landscape"
  },
  { 
    value: "1536x1024", 
    label: "1536×1024", 
    description: "3:2 Landscape",
    category: "landscape"
  },
  { 
    value: "1920x1080", 
    label: "1920×1080", 
    description: "Full HD Landscape",
    category: "landscape"
  },
  { 
    value: "1600x900", 
    label: "1600×900", 
    description: "16:9 Medium",
    category: "landscape"
  },
  { 
    value: "1024x1536", 
    label: "1024×1536", 
    description: "2:3 Portrait",
    category: "portrait"
  },
  { 
    value: "1080x1920", 
    label: "1080×1920", 
    description: "Full HD Portrait",
    category: "portrait"
  },
  { 
    value: "900x1600", 
    label: "900×1600", 
    description: "9:16 Medium",
    category: "portrait"
  }
];

const categoryColors = {
  square: "bg-blue-100 text-blue-800",
  landscape: "bg-green-100 text-green-800", 
  portrait: "bg-purple-100 text-purple-800"
};

export function SizeSelector({ selectedSize, onSizeChange, className }: SizeSelectorProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Output Size
      </label>
      <Select value={selectedSize} onValueChange={onSizeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select image size" />
        </SelectTrigger>
        <SelectContent>
          {sizeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{option.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${categoryColors[option.category]}`}
                >
                  {option.description}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        Sizes will be optimized for best OpenAI compatibility
      </p>
    </div>
  );
}
