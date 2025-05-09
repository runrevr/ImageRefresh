import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Image, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MultiImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string; // e.g. "image/jpeg,image/png,image/webp"
}

export default function MultiImageUploader({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = "image/jpeg,image/png,image/webp"
}: MultiImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file validation
  const validateFiles = (files: File[]): { valid: File[], error?: string } => {
    // Check if there are too many files
    if (files.length > maxFiles) {
      return { 
        valid: files.slice(0, maxFiles), 
        error: `Maximum ${maxFiles} images allowed. Only the first ${maxFiles} will be used.`
      };
    }
    
    // Check file types
    const acceptedTypesArray = acceptedTypes.split(',');
    const invalidFiles = files.filter(file => !acceptedTypesArray.includes(file.type));
    
    if (invalidFiles.length > 0) {
      const validFiles = files.filter(file => acceptedTypesArray.includes(file.type));
      return {
        valid: validFiles,
        error: `Some files have unsupported formats. Only ${acceptedTypes.split(',').join(', ')} are supported.`
      };
    }
    
    return { valid: files };
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validation = validateFiles(filesArray);
      
      if (validation.error) {
        setError(validation.error);
      }
      
      onFilesSelected(validation.valid);
    }
  };

  // Handle file drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const validation = validateFiles(filesArray);
      
      if (validation.error) {
        setError(validation.error);
      }
      
      onFilesSelected(validation.valid);
    }
  };

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  // Handle click to select files
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onClick={handleClick}
        onDragOver={(e) => handleDrag(e, true)}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-base font-medium">
              Drag and drop product images here, or click to select
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload up to {maxFiles} product images for enhancement
            </p>
          </div>
          <Button 
            variant="outline" 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Image className="mr-2 h-4 w-4" />
            Select Images
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Supported formats: JPG, PNG, WebP • Max {maxFiles} images • Max 10MB per image
      </p>
    </div>
  );
}