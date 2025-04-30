import { useState } from "react";
import { Layout } from "./Layout";
import CompactStyleSelector from "./CompactStyleSelector";
import { 
  type Style, 
  type Category,
  getCategories, 
  getStylesByCategory, 
  getCategory 
} from "../../../shared/data.utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Image, 
  Upload, 
  Paintbrush, 
  ImageIcon, 
  CreditCard,
  Clock,
  Box as BoxIcon,
  Sparkles
} from "lucide-react";

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
  const categories = getCategories();
  
  // Get category icons from data
  const getCategoryIcon = (iconName?: string): React.ReactNode => {
    switch(iconName) {
      case 'ImageIcon': return <ImageIcon className="h-10 w-10" />;
      case 'Paintbrush': return <Paintbrush className="h-10 w-10" />;
      case 'Clock': return <Clock className="h-10 w-10" />;
      case 'BoxIcon': return <BoxIcon className="h-10 w-10" />;
      case 'Sparkles': return <Sparkles className="h-10 w-10" />;
      default: return <Paintbrush className="h-10 w-10" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Choose a Category</h2>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {categories.map((category: Category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all hover:border-[#2A7B9B] hover:shadow-md ${
              selectedCategoryId === category.id ? 'border-[#2A7B9B] bg-[#2A7B9B]/5' : ''
            }`}
            onClick={() => onNext(category.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="mb-3 p-2 rounded-full">
                {getCategoryIcon(category.icon)}
              </div>
              <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-4 space-x-1">
        {categories.length > 3 && Array.from({ length: Math.ceil(categories.length / 3) }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#2A7B9B]' : 'bg-gray-300'}`}
          />
        ))}
      </div>
      
      <div className="flex justify-between w-full mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <div className="text-sm text-gray-500 self-center">
          Step 2 of 4
        </div>
        <Button 
          onClick={() => onNext(selectedCategoryId || categories[0]?.id || '')} 
          className="bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white"
        >
          Next
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
  const styles = getStylesByCategory(categoryId);
  const category = getCategory(categoryId);
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(selectedStyleId);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span>Categories</span>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="font-medium text-gray-900">{category?.name || 'Category'}</span>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Select a Style</h2>
      
      {/* Style grid - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {styles.map((style: Style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all overflow-hidden hover:border-[#2A7B9B] hover:shadow-md ${
              localSelectedId === style.id ? 'border-[#2A7B9B] bg-[#2A7B9B]/5' : ''
            }`}
            onClick={() => setLocalSelectedId(style.id)}
          >
            {/* Image at the top */}
            <div className="aspect-square w-full bg-gray-100 overflow-hidden">
              {style.previewImage && (
                <img 
                  src={style.previewImage}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Text content below image */}
            <CardContent className="p-3">
              {/* Style name */}
              <h3 className="font-semibold text-base mb-1">{style.name}</h3>
              
              {/* Style description */}
              <p className="text-xs text-gray-500 line-clamp-2">{style.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center mt-4 space-x-1">
        {styles.length > 4 && Array.from({ length: Math.ceil(styles.length / 4) }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#2A7B9B]' : 'bg-gray-300'}`}
          />
        ))}
      </div>
      
      <div className="flex justify-between w-full mt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <div className="text-sm text-gray-500 self-center">
          Step 3 of 4
        </div>
        <Button 
          onClick={() => {
            if (localSelectedId) {
              const style = styles.find((s: Style) => s.id === localSelectedId);
              if (style) onNext(style);
            }
          }} 
          className="bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white"
          disabled={!localSelectedId}
        >
          Next
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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
        {/* Left side - Original Image */}
        <div className="border rounded-lg overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Original" 
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="bg-gray-100 h-64 w-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Right side - Style info */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">
            {selectedStyle?.name || "Style"}
          </h2>
          <h3 className="text-lg mb-2">
            {selectedStyle?.category ? getCategory(selectedStyle.category)?.name : ""}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedStyle?.description || "No style selected"}
          </p>
          
          {/* Description text area */}
          <div className="border rounded p-3 mt-auto">
            <p className="text-sm text-gray-500">description</p>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex w-full justify-between gap-4 mt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="min-w-[120px]"
        >
          Back
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={!selectedStyle || !imageUrl}
          className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white min-w-[200px]"
        >
          Create Magic
        </Button>
      </div>
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