import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ArrowUpFromLine, Image, FileWarning } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface ImageUploaderProps {
  onImageUploaded: (imagePath: string, imageUrl: string) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Only JPEG, PNG, and WebP images are allowed');
      return false;
    }

    if (file.size > maxSize) {
      setFileError(`File size exceeds 10MB limit (${formatBytes(file.size)})`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onImageUploaded(data.imagePath, data.imageUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelection = (file: File) => {
    if (validateFile(file)) {
      uploadFile(file);
    } else {
      toast({
        title: 'Invalid File',
        description: fileError,
        variant: 'destructive',
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <div
          className={`border-2 border-dashed ${
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          } rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium">Uploading image...</p>
            </div>
          ) : (
            <>
              <ArrowUpFromLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Drag & drop your image here</h3>
              <p className="text-gray-500 mb-6">or click to browse files</p>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept="image/jpeg,image/png,image/webp"
              />
              <Button>
                Select Image
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Accepted formats: JPG, PNG, WebP • Max size: 10MB
              </p>
            </>
          )}
        </div>
        
        {fileError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
            <FileWarning className="h-5 w-5 mr-2" />
            <span>{fileError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
