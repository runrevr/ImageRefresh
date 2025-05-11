import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Component for the announcement banner
const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#FF7B54] text-white p-4 text-center font-medium">
      New: Transform your product photos with AI in seconds!
      <button className="underline ml-2">Try it now</button>
      <button 
        className="ml-4 font-bold focus:outline-none" 
        aria-label="Dismiss"
        onClick={() => setIsVisible(false)}
      >
        ✕
      </button>
    </div>
  );
};

// Component for the hero section
const HeroSection = () => {
  return (
    <section className="container mx-auto text-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-[#2a7b9b]">
        Turn Ordinary Photos into Scroll-Stopping Product Shots
      </h1>
      <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
        Upload your images, choose from curated AI styles, and download stunning, high-converting visuals in moments—no designer needed.
      </p>
      <a 
        href="#upload" 
        className="bg-[#2a7b9b] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-[#2a7b9b]/90 transition"
      >
        Enhance Your First Image →
      </a>
    </section>
  );
};

// Component for the upload section
const UploadSection = ({ onImagesSelected, isUploading }: { onImagesSelected: (files: File[]) => void, isUploading: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith("image/")
      );
      
      if (fileArray.length > 5) {
        alert("You can upload a maximum of 5 images at a time");
        return;
      }
      
      setUploadedFiles(fileArray);
      onImagesSelected(fileArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files).filter(
        file => file.type.startsWith("image/")
      );
      
      if (fileArray.length > 5) {
        alert("You can upload a maximum of 5 images at a time");
        return;
      }
      
      setUploadedFiles(fileArray);
      onImagesSelected(fileArray);
    }
  };

  const borderClass = dragging 
    ? "border-[#2a7b9b]" 
    : "border-[#a3e4d7] hover:border-[#2a7b9b]";

  return (
    <section id="upload" className="container mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-2 text-[#2a7b9b]">Upload Your Product Images</h2>
      <p className="text-sm text-gray-700 mb-4">
        Supported formats: JPG, PNG, WEBP. Max 10MB per image. Upload up to 5 images.
      </p>
      <div 
        className={`border-2 border-dashed ${borderClass} rounded-lg p-12 text-center transition`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="mb-4">Drag & Drop Images Here</p>
        <button 
          className="bg-[#a3e4d7] text-gray-800 px-4 py-2 rounded font-medium hover:bg-[#a3e4d7]/90 transition"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Browse Files"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
        />
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-tl-lg">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// Industry selector component
const IndustrySelector = ({ onIndustryChange, disabled }: { onIndustryChange: (industry: string) => void, disabled: boolean }) => {
  const industries = [
    "Fashion & Apparel",
    "Beauty & Cosmetics",
    "Home & Furniture",
    "Electronics",
    "Food & Beverage",
    "Jewelry & Accessories",
    "Sports & Outdoor",
    "Health & Wellness",
    "Toys & Children",
    "Pets",
    "Other"
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Your Industry
      </label>
      <select 
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2a7b9b] focus:border-[#2a7b9b]"
        onChange={(e) => onIndustryChange(e.target.value)}
        disabled={disabled}
        defaultValue=""
      >
        <option value="" disabled>Select an industry...</option>
        {industries.map((industry) => (
          <option key={industry} value={industry}>{industry}</option>
        ))}
      </select>
    </div>
  );
};

// Style selection component
type EnhancementOption = {
  key: string;
  name: string;
  description: string;
};

type ImageWithOptions = {
  id: number;
  originalPath: string;
  options: Record<string, EnhancementOption>;
  selectedOptions: Set<string>;
};

const StyleSelectionSection = ({ 
  images, 
  onSelectOption, 
  onSubmitSelections,
  isLoading,
  maxSelectionsPerImage = 5
}: { 
  images: ImageWithOptions[]; 
  onSelectOption: (imageId: number, optionKey: string, selected: boolean) => void;
  onSubmitSelections: () => void;
  isLoading: boolean;
  maxSelectionsPerImage?: number;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const currentImage = images[selectedImageIndex];
  
  const totalOptionsSelected = images.reduce((total, img) => total + img.selectedOptions.size, 0);
  const currentImageSelectionsCount = currentImage ? currentImage.selectedOptions.size : 0;
  
  const handleOptionClick = (optionKey: string) => {
    if (!currentImage) return;
    
    const isCurrentlySelected = currentImage.selectedOptions.has(optionKey);
    
    // If not selected and would exceed max, prevent
    if (!isCurrentlySelected && currentImageSelectionsCount >= maxSelectionsPerImage) {
      alert(`You can only select up to ${maxSelectionsPerImage} options per image`);
      return;
    }
    
    onSelectOption(currentImage.id, optionKey, !isCurrentlySelected);
  };
  
  const selectAllOptionsForCurrentImage = () => {
    if (!currentImage || !currentImage.options) return;
    
    // Get up to max options
    const optionKeys = Object.keys(currentImage.options).slice(0, maxSelectionsPerImage);
    
    // Select each option
    optionKeys.forEach(key => {
      if (!currentImage.selectedOptions.has(key)) {
        onSelectOption(currentImage.id, key, true);
      }
    });
  };
  
  if (images.length === 0) {
    return null;
  }
  
  return (
    <section className="container mx-auto mb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold mb-2 text-gray-800">Images</h3>
          <ul className="space-y-4">
            {images.map((image, index) => (
              <li 
                key={image.id} 
                className={`cursor-pointer p-2 rounded transition ${selectedImageIndex === index ? 'bg-[#a3e4d7]/30 border-l-4 border-[#2a7b9b]' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={image.originalPath} 
                    alt={`Image ${index + 1}`} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">Image {index + 1}</p>
                    <p className="text-sm text-gray-500">
                      {image.selectedOptions.size} of {maxSelectionsPerImage} selected
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        
        <div className="lg:w-3/4 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">AI Style Suggestions</h3>
            <div className="flex items-center space-x-4">
              <button 
                className="text-sm underline font-medium hover:text-[#2a7b9b] transition"
                onClick={selectAllOptionsForCurrentImage}
              >
                Select All Styles
              </button>
              <span className="text-gray-600">
                {currentImageSelectionsCount} of {maxSelectionsPerImage} selected
              </span>
            </div>
          </div>
          
          {currentImage && (
            <>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  Each selection costs 1 credit. You can select up to {maxSelectionsPerImage} options per image.
                </p>
                <p className="text-sm mt-1 font-medium">
                  Total selected: {totalOptionsSelected} option{totalOptionsSelected !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentImage.options && Object.entries(currentImage.options).map(([key, option]) => {
                  const isSelected = currentImage.selectedOptions.has(key);
                  return (
                    <div 
                      key={key}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition ${isSelected ? 'border-[#2a7b9b] ring-2 ring-[#2a7b9b]/30' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => handleOptionClick(key)}
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{option.name}</h4>
                          <div className={`w-5 h-5 rounded-full border ${isSelected ? 'bg-[#2a7b9b] border-[#2a7b9b]' : 'border-gray-300'} flex items-center justify-center`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          <button
            className="mt-6 bg-[#2a7b9b] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2a7b9b]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={totalOptionsSelected === 0 || isLoading}
            onClick={onSubmitSelections}
          >
            {isLoading ? "Processing..." : "Enhance Image(s)"}
          </button>
        </div>
      </div>
    </section>
  );
};

// Results component
type EnhancementResult = {
  imageId: number;
  optionKey: string;
  optionName: string;
  resultImage1Path: string;
  resultImage2Path: string;
  description?: string;
};

const ResultsSection = ({ results }: { results: EnhancementResult[] }) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  if (results.length === 0) {
    return null;
  }

  const toggleImageSelection = (imagePath: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imagePath)) {
      newSelected.delete(imagePath);
    } else {
      newSelected.add(imagePath);
    }
    setSelectedImages(newSelected);
  };

  const selectAllImages = () => {
    const allImagePaths = new Set<string>();
    results.forEach((result) => {
      allImagePaths.add(result.resultImage1Path);
      allImagePaths.add(result.resultImage2Path);
    });
    setSelectedImages(allImagePaths);
  };

  const downloadSelected = () => {
    // In a real application, we would implement proper downloading here
    // For now, we'll just show an alert
    alert(`Downloading ${selectedImages.size} selected images`);
    
    // Mock implementation: create a download for each selected image
    selectedImages.forEach((imagePath) => {
      const link = document.createElement('a');
      link.href = imagePath;
      link.download = imagePath.split('/').pop() || 'enhanced-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <section className="container mx-auto bg-white p-8 rounded-lg shadow-md mb-16">
      <h2 className="text-2xl font-bold mb-4 text-[#2a7b9b]">Review & Select Your Favorites</h2>
      <div className="flex justify-end mb-4">
        <button 
          className="text-sm underline font-medium hover:text-[#2a7b9b] transition"
          onClick={selectAllImages}
        >
          Select All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {results.flatMap((result, index) => [
          // First image
          <div key={`${index}-1`} className="relative border rounded-lg overflow-hidden p-2">
            <input 
              type="checkbox" 
              className="absolute top-2 left-2 w-5 h-5 accent-[#2a7b9b]" 
              checked={selectedImages.has(result.resultImage1Path)}
              onChange={() => toggleImageSelection(result.resultImage1Path)}
            />
            <img
              src={result.resultImage1Path}
              alt={`Result ${index + 1} - Variation 1`}
              className="w-full h-48 object-cover rounded mt-2"
            />
            <div className="mt-2">
              <p className="font-medium text-sm">{result.optionName} - Variation 1</p>
              {result.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {result.description}
                </p>
              )}
            </div>
          </div>,
          // Second image
          <div key={`${index}-2`} className="relative border rounded-lg overflow-hidden p-2">
            <input 
              type="checkbox" 
              className="absolute top-2 left-2 w-5 h-5 accent-[#2a7b9b]" 
              checked={selectedImages.has(result.resultImage2Path)}
              onChange={() => toggleImageSelection(result.resultImage2Path)}
            />
            <img
              src={result.resultImage2Path}
              alt={`Result ${index + 1} - Variation 2`}
              className="w-full h-48 object-cover rounded mt-2"
            />
            <div className="mt-2">
              <p className="font-medium text-sm">{result.optionName} - Variation 2</p>
              {result.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {result.description}
                </p>
              )}
            </div>
          </div>
        ])}
      </div>
      <button 
        className="bg-[#ff7b54] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#ff7b54]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={selectedImages.size === 0}
        onClick={downloadSelected}
      >
        Download Selected Images ({selectedImages.size})
      </button>
    </section>
  );
};

// Intermediary results page
const ProcessingSection = () => {
  return (
    <section className="container mx-auto text-center py-12">
      <div className="animate-spin w-16 h-16 border-4 border-[#2a7b9b] border-t-transparent rounded-full mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold mb-2 text-[#2a7b9b]">Processing Your Images</h2>
      <p className="text-gray-600">
        We're applying the selected enhancements to your images. This may take a few moments...
      </p>
    </section>
  );
};

// Main component
export default function ProductEnhancementWebhook() {
  const { toast } = useToast();
  const [step, setStep] = useState<'upload' | 'selectStyles' | 'processing' | 'results'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [industry, setIndustry] = useState<string>("");
  const [enhancementId, setEnhancementId] = useState<number | null>(null);
  const [enhancementImages, setEnhancementImages] = useState<ImageWithOptions[]>([]);
  const [results, setResults] = useState<EnhancementResult[]>([]);
  
  // Mutations for uploading images and submitting selections
  const uploadMutation = useMutation({
    mutationFn: async ({ files, industry }: { files: File[], industry: string }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("industry", industry);
      
      const response = await apiRequest("POST", "/api/product-enhancement", formData, true);
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.id) {
        setEnhancementId(data.id);
        toast({
          title: "Upload successful",
          description: "Your images have been uploaded successfully. Waiting for enhancement options...",
        });
        setStep('selectStyles');
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const selectionsMutation = useMutation({
    mutationFn: async (selections: { imageId: number, optionKey: string }[]) => {
      if (!enhancementId) throw new Error("Enhancement ID is missing");
      
      const response = await apiRequest(
        "POST", 
        `/api/product-enhancement/${enhancementId}/select`,
        { selections }
      );
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.results) {
        setResults(data.results);
        toast({
          title: "Enhancement complete",
          description: "Your images have been enhanced successfully.",
        });
        setStep('results');
      }
    },
    onError: (error) => {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance images. Please try again.",
        variant: "destructive",
      });
      setStep('selectStyles');
    }
  });
  
  // Define a type for our enhancement data
  type EnhancementData = {
    id: number;
    status: string;
    industry: string;
    images: Array<{
      id: number;
      originalImagePath: string;
      options?: Record<string, {
        name: string;
        description: string;
      }>;
    }>;
  };
  
  // Query to fetch enhancement data (images and options)
  const { data: enhancementData, isLoading: isLoadingEnhancement } = useQuery({
    queryKey: ['/api/product-enhancement', enhancementId],
    queryFn: async () => {
      if (!enhancementId) return null;
      const response = await apiRequest("GET", `/api/product-enhancement/${enhancementId}`);
      return await response.json();
    },
    enabled: !!enhancementId && step === 'selectStyles',
    // Poll every 3 seconds if not completed
    refetchInterval: 3000,
  });
  
  // Custom polling logic to stop when completed
  useEffect(() => {
    if (enhancementData && 'status' in enhancementData && enhancementData.status === 'completed') {
      // Stop polling once completed
      queryClient.cancelQueries({ queryKey: ['/api/product-enhancement', enhancementId] });
    }
  }, [enhancementData, enhancementId]);
  
  // Update enhancement images when data changes
  useEffect(() => {
    if (enhancementData && 'images' in enhancementData && Array.isArray(enhancementData.images)) {
      const imagesWithOptions = enhancementData.images.map((img: any) => ({
        id: img.id,
        originalPath: img.originalImagePath,
        options: img.options || {},
        selectedOptions: new Set<string>()
      }));
      
      setEnhancementImages(imagesWithOptions);
    }
  }, [enhancementData]);
  
  // Handle file selection
  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  // Handle industry selection
  const handleIndustryChange = (selectedIndustry: string) => {
    setIndustry(selectedIndustry);
  };
  
  // Handle form submission
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!industry) {
      toast({
        title: "Industry required",
        description: "Please select your industry before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({ files: selectedFiles, industry });
  };
  
  // Handle option selection
  const handleSelectOption = (imageId: number, optionKey: string, selected: boolean) => {
    setEnhancementImages(prev => {
      return prev.map(img => {
        if (img.id === imageId) {
          const newSelectedOptions = new Set(img.selectedOptions);
          if (selected) {
            newSelectedOptions.add(optionKey);
          } else {
            newSelectedOptions.delete(optionKey);
          }
          
          return {
            ...img,
            selectedOptions: newSelectedOptions
          };
        }
        return img;
      });
    });
  };
  
  // Handle selections submission
  const handleSubmitSelections = () => {
    const selections: { imageId: number, optionKey: string }[] = [];
    
    enhancementImages.forEach(img => {
      img.selectedOptions.forEach(optionKey => {
        selections.push({
          imageId: img.id,
          optionKey
        });
      });
    });
    
    if (selections.length === 0) {
      toast({
        title: "No options selected",
        description: "Please select at least one enhancement option.",
        variant: "destructive",
      });
      return;
    }
    
    setStep('processing');
    selectionsMutation.mutate(selections);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBanner />
      
      <HeroSection />
      
      {step === 'upload' && (
        <>
          <UploadSection 
            onImagesSelected={handleImagesSelected} 
            isUploading={uploadMutation.isPending}
          />
          
          <div className="container mx-auto mb-8">
            <IndustrySelector 
              onIndustryChange={handleIndustryChange}
              disabled={uploadMutation.isPending}
            />
            
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || !industry || uploadMutation.isPending}
                className="bg-[#2a7b9b] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#2a7b9b]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? "Uploading..." : "Continue"}
              </button>
            </div>
          </div>
        </>
      )}
      
      {step === 'selectStyles' && (
        <StyleSelectionSection
          images={enhancementImages}
          onSelectOption={handleSelectOption}
          onSubmitSelections={handleSubmitSelections}
          isLoading={selectionsMutation.isPending || isLoadingEnhancement}
        />
      )}
      
      {step === 'processing' && <ProcessingSection />}
      
      {step === 'results' && <ResultsSection results={results} />}
    </div>
  );
}