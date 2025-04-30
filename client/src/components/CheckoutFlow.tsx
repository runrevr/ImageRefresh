import { useState } from "react";
import { Layout } from "./Layout";
import CompactStyleSelector from "./CompactStyleSelector";
import { type Style } from "../../../shared/data.utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronLeft, ChevronRight, Image, Upload, Paintbrush, ImageIcon, CreditCard } from "lucide-react";

// Step components
interface StepProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index + 1 <= currentStep 
                  ? 'bg-[#2A7B9B] text-white' 
                  : 'bg-gray-200 text-gray-500'}
              `}
            >
              {index + 1}
            </div>
            <div className="text-xs mt-1 text-center">
              {index === 0 && "Upload"}
              {index === 1 && "Choose Category"}
              {index === 2 && "Pick Style"}
              {index === 3 && "Confirm"}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 h-1 w-full bg-gray-200"></div>
        <div 
          className="absolute top-0 h-1 bg-[#2A7B9B] transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

// Upload step
interface UploadStepProps {
  onNext: () => void;
  onBack: () => void;
  onImageSelected: (image: File) => void;
  selectedImage?: string;
}

const UploadStep = ({ onNext, onBack, onImageSelected, selectedImage }: UploadStepProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
      // Auto-proceed to next step when image is selected
      setTimeout(onNext, 500);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Upload Image</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full max-w-md flex flex-col items-center justify-center min-h-[300px]">
        {selectedImage ? (
          <div className="w-full h-64 relative">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="w-full h-full object-contain" 
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-4 absolute bottom-0 left-1/2 transform -translate-x-1/2"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              Crop / Replace
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">Drag and drop your image here, or click to upload</p>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              Upload
            </Button>
          </>
        )}
        <input 
          type="file" 
          id="image-upload" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      <div className="flex justify-between w-full max-w-md mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedImage}
          className="bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Category step
interface CategoryStepProps {
  onNext: (categoryId: string) => void;
  onBack: () => void;
  selectedCategoryId?: string;
}

const CategoryStep = ({ onNext, onBack, selectedCategoryId }: CategoryStepProps) => {
  // This step now uses the category tabs from CompactStyleSelector indirectly
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Choose Category</h2>
      <CompactStyleSelector
        onSelectStyle={(style) => {
          // Navigate directly to style step
          onNext(style.category);
        }}
        initialCategory={selectedCategoryId}
        maxHeight="400px"
      />
      
      <div className="flex justify-between w-full max-w-md mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={() => onNext(selectedCategoryId || '')} 
          disabled={!selectedCategoryId}
          className="bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Style step
interface StyleStepProps {
  onNext: (style: Style) => void;
  onBack: () => void;
  categoryId: string;
  selectedStyleId?: string;
}

const StyleStep = ({ onNext, onBack, categoryId, selectedStyleId }: StyleStepProps) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Pick a Style</h2>
      <CompactStyleSelector
        onSelectStyle={onNext}
        selectedStyleId={selectedStyleId}
        initialCategory={categoryId}
        maxHeight="400px"
      />
      
      <div className="flex justify-between w-full max-w-md mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    </div>
  );
};

// Confirm step
interface ConfirmStepProps {
  onConfirm: () => void;
  onBack: () => void;
  imageUrl?: string;
  selectedStyle?: Style;
}

const ConfirmStep = ({ onConfirm, onBack, imageUrl, selectedStyle }: ConfirmStepProps) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">Confirm Your Selection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Original Image</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-4">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Original" 
                className="max-h-60 object-contain"
              />
            ) : (
              <div className="bg-gray-100 h-60 w-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Selected Style</CardTitle>
            <CardDescription>{selectedStyle?.name || "No style selected"}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-4">
            {selectedStyle ? (
              <img 
                src={selectedStyle.previewImage} 
                alt={selectedStyle.name} 
                className="max-h-60 object-contain"
              />
            ) : (
              <div className="bg-gray-100 h-60 w-full flex items-center justify-center">
                <Paintbrush className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="w-full max-w-3xl mt-8">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-sm">Base transformation</span>
              <span className="text-sm font-medium">1 credit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Style: {selectedStyle ? selectedStyle.name : 'Not selected'}</span>
              <span className="text-sm font-medium">0 credits</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>1 credit</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!selectedStyle || !imageUrl}
            className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white"
          >
            Confirm and Transform
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Main checkout flow component
interface CheckoutFlowProps {
  onComplete: (imageUrl: string, style: Style) => void;
  initialImageUrl?: string;
  initialStyle?: Style;
}

export default function CheckoutFlow({ onComplete, initialImageUrl, initialStyle }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialStyle?.category);
  const [selectedStyle, setSelectedStyle] = useState<Style | undefined>(initialStyle);
  
  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleStyleSelected = (style: Style) => {
    setSelectedStyle(style);
    setStep(4); // Go directly to confirm step when style is selected
  };

  const handleCategorySelected = (id: string) => {
    setCategoryId(id);
    setStep(3);
  };

  const handleConfirm = () => {
    if (imageUrl && selectedStyle) {
      onComplete(imageUrl, selectedStyle);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <StepIndicator currentStep={step} totalSteps={4} />
      
      {step === 1 && (
        <UploadStep 
          onNext={() => setStep(2)} 
          onBack={() => {/* Go back to previous page */}} 
          onImageSelected={handleImageSelected}
          selectedImage={imageUrl}
        />
      )}
      
      {step === 2 && (
        <CategoryStep 
          onNext={handleCategorySelected} 
          onBack={() => setStep(1)} 
          selectedCategoryId={categoryId}
        />
      )}
      
      {step === 3 && categoryId && (
        <StyleStep 
          onNext={handleStyleSelected} 
          onBack={() => setStep(2)} 
          categoryId={categoryId}
          selectedStyleId={selectedStyle?.id}
        />
      )}
      
      {step === 4 && (
        <ConfirmStep 
          onConfirm={handleConfirm} 
          onBack={() => setStep(3)} 
          imageUrl={imageUrl}
          selectedStyle={selectedStyle}
        />
      )}
    </div>
  );
}