import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Image } from "lucide-react";

interface MultiImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export default function MultiImageUploader({
  onFilesSelected,
  maxFiles = 5
}: MultiImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const fileArray = Array.from(e.target.files);
    const newFiles = [...selectedFiles, ...fileArray];
    
    // Enforce maximum file limit
    const limitedFiles = newFiles.slice(0, maxFiles);
    
    setSelectedFiles(limitedFiles);
    onFilesSelected(limitedFiles);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      
      // Filter for only image files
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      
      // Combine with existing files
      const newFiles = [...selectedFiles, ...imageFiles];
      
      // Enforce maximum file limit
      const limitedFiles = newFiles.slice(0, maxFiles);
      
      setSelectedFiles(limitedFiles);
      onFilesSelected(limitedFiles);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Remove a file from the selection
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        
        <div className="mt-4">
          <p className="text-base font-medium">
            Drag and drop up to {maxFiles} product images
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Each image will be enhanced individually
          </p>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleButtonClick}
          className="mt-4"
        >
          <Image className="mr-2 h-4 w-4" />
          Select Images
        </Button>
      </div>

      {/* Image preview section */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">
            Uploaded Images ({selectedFiles.length}/{maxFiles})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedFiles.map((file, index) => (
              <div 
                key={index} 
                className="relative group border rounded-md overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p className="text-white text-xs truncate">
                    {file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}