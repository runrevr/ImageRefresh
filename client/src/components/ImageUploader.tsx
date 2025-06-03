import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ArrowUpFromLine, Image, FileWarning, Copy, Download, Camera, Upload } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string, fileName: string) => void;
  userCredits?: any;
  onShowSignupModal?: () => void;
}

// Category options for image types
const CATEGORIES = [
  { id: 'portrait', label: 'Portrait', description: 'People, faces, headshots' },
  { id: 'product', label: 'Product', description: 'Items, objects, merchandise' },
  { id: 'landscape', label: 'Landscape', description: 'Scenery, nature, outdoor views' },
  { id: 'pet', label: 'Pet', description: 'Animals, pets, wildlife' },
  { id: 'food', label: 'Food', description: 'Meals, dishes, ingredients' },
  { id: 'other', label: 'Other', description: 'Everything else' }
];

// Size options for output
const SIZES = [
  { id: 'square', label: 'Square (1024×1024)', description: 'Perfect for social media' },
  { id: 'portrait', label: 'Portrait (1024×1792)', description: 'Tall images' },
  { id: 'landscape', label: 'Landscape (1792×1024)', description: 'Wide images' }
];

// Sample images that users can try
const SAMPLE_IMAGES = [
  {
    name: 'Product Bottle',
    url: '/src/assets/shampoo-original.jpg',
    description: 'Professional product photo'
  },
  {
    name: 'Pet Portrait',
    url: '/src/assets/bear-real.png',
    description: 'Animal photography'
  },
  {
    name: 'Food Item',
    url: '/src/assets/mexican-food-original.png',
    description: 'Food photography'
  }
];

export default function ImageUploader({ onImageUpload, userCredits, onShowSignupModal }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
    dimensions?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
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

  // Add paste functionality
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') === 0) {
            const file = items[i].getAsFile();
            if (file) {
              handleFileSelection(file);
              toast({
                title: 'Image Pasted',
                description: 'Image pasted from clipboard successfully!',
              });
            }
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [toast]);

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

  const getImageDimensions = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve(`${img.width} × ${img.height}`);
      };
      img.onerror = () => {
        resolve('Unknown');
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelection = async (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Get file details including dimensions
      const dimensions = await getImageDimensions(file);
      setFileDetails({
        name: file.name,
        size: formatBytes(file.size),
        dimensions
      });

      // Auto-upload after a brief delay for smooth transition
      setTimeout(() => {
        uploadFile(file);
      }, 500);
    } else {
      toast({
        title: 'Invalid File',
        description: fileError,
        variant: 'destructive',
      });
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);
                  const fileName = file.name;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log("Upload response data:", data);

      if (!data.imagePath || !data.imageUrl) {
        console.error("Missing image path or URL in response:", data);
        throw new Error("Server returned incomplete image data");
      }

      // Small delay to show 100% progress
      setTimeout(() => {
          console.log("Calling onImageUpload with:", data.imageUrl, fileName);
          onImageUpload(data.imageUrl, fileName);
        }, 300);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
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

  // Mobile camera functions
  const takePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const uploadPhoto = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

  // Handle camera and upload inputs
  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleSampleImageSelect = async (sampleImage: typeof SAMPLE_IMAGES[0]) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Fetch the sample image
      const response = await fetch(sampleImage.url);
      const blob = await response.blob();
      const file = new File([blob], sampleImage.name + '.jpg', { type: 'image/jpeg' });

      // Create preview and details
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setSelectedFile(file);

      const dimensions = await getImageDimensions(file);
      setFileDetails({
        name: file.name,
        size: formatBytes(file.size),
        dimensions
      });

      // Upload the sample image
      setTimeout(() => {
        uploadFile(file);
      }, 500);

      toast({
        title: 'Sample Image Selected',
        description: `Using "${sampleImage.description}" as your sample image.`,
      });

    } catch (error) {
      console.error('Error loading sample image:', error);
      toast({
        title: 'Sample Image Error',
        description: 'Failed to load sample image. Please try uploading your own.',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {!selectedFile ? (
          // Initial upload state
          <div className="space-y-6">
            {/* Mobile Interface */}
            {isMobile ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-medium mb-2">Add Your Image</h3>
                  <p className="text-gray-500">Take a photo or choose from your gallery</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={takePhoto}
                    className="h-32 flex flex-col items-center justify-center space-y-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-sm font-medium">Take Photo</span>
                  </Button>

                  <Button
                    onClick={uploadPhoto}
                    className="h-32 flex flex-col items-center justify-center space-y-2 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">Choose Photo</span>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Accepted formats: JPG, PNG, WebP • Max size: 10MB
                  </p>
                </div>

                {/* Hidden inputs for mobile */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleCameraChange}
                />
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleUploadChange}
                />
              </div>
            ) : (
              // Desktop Interface
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 border-solid scale-[1.02]"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100 hover:scale-[1.01]"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClickUpload}
              >
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

                <RainbowButton>
                    Select Image
                  </RainbowButton>

                <p className="text-sm text-gray-500 mt-4">
                  Accepted formats: JPG, PNG, WebP • Max size: 10MB
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  💡 Tip: You can also paste images with Ctrl+V
                </p>
              </div>
            )}
          </div>
        ) : (
          // File selected state with preview
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* File Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* File Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">File Details</h3>
                    {fileDetails && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <p className="font-medium truncate">{fileDetails.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <p className="font-medium">{fileDetails.size}</p>
                        </div>
                        {fileDetails.dimensions && (
                          <div>
                            <span className="text-gray-500">Dimensions:</span>
                            <p className="font-medium">{fileDetails.dimensions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Uploading...</span>
                        <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success state */}
                  {!isUploading && uploadProgress === 100 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Upload complete! Proceeding to transformation...</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isUploading && uploadProgress !== 100 && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setFileDetails(null);
                          setUploadProgress(0);
                        }}
                      >
                        Choose Different Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {fileError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center animate-in slide-in-from-top-2 duration-300">
            <FileWarning className="h-5 w-5 mr-2" />
            <span>{fileError}</span>
          </div>
        )}
      </div>
    </div>
  );
}