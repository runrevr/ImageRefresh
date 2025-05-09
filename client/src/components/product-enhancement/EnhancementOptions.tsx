import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from '@/components/ui/alert';

interface EnhancementImage {
  id: number;
  originalImagePath: string;
  imageUrl: string;
  options: string[];
  selectedOptions: string[];
}

interface EnhancementData {
  id: number;
  status: string;
  industry: string;
  creditsUsed: number;
  images: EnhancementImage[];
}

interface EnhancementOptionsProps {
  enhancementData: EnhancementData;
  onSubmit: (selections: Array<{ imageId: number; selectedOptions: string[] }>) => void;
  isSubmitting: boolean;
}

export default function EnhancementOptions({
  enhancementData,
  onSubmit,
  isSubmitting
}: EnhancementOptionsProps) {
  // Initialize selections from enhancementData
  const [selections, setSelections] = useState<Map<number, Set<string>>>(new Map());

  // Calculate total cost (1 credit per option)
  const [totalCredits, setTotalCredits] = useState(0);

  // Initialize selections from enhancementData on load or data change
  useEffect(() => {
    const initialSelections = new Map<number, Set<string>>();
    
    enhancementData.images.forEach(image => {
      // Initialize with existing selections if any
      if (image.selectedOptions && image.selectedOptions.length > 0) {
        initialSelections.set(image.id, new Set(image.selectedOptions));
      } else {
        initialSelections.set(image.id, new Set());
      }
    });
    
    setSelections(initialSelections);
    
    // Calculate initial credits
    calculateTotalCredits(initialSelections);
  }, [enhancementData]);

  // Calculate total credits needed based on selections
  const calculateTotalCredits = (currentSelections: Map<number, Set<string>>) => {
    let total = 0;
    
    currentSelections.forEach((options) => {
      total += options.size;
    });
    
    setTotalCredits(total);
  };

  // Toggle an option selection
  const toggleOption = (imageId: number, option: string) => {
    const imageSelections = selections.get(imageId) || new Set();
    const newSelections = new Map(selections);
    
    // Toggle the option
    if (imageSelections.has(option)) {
      imageSelections.delete(option);
    } else {
      // Check if we're within the 5 option limit per image
      if (imageSelections.size >= 5) {
        return; // Don't add more than 5 options per image
      }
      imageSelections.add(option);
    }
    
    newSelections.set(imageId, imageSelections);
    setSelections(newSelections);
    
    // Recalculate credits
    calculateTotalCredits(newSelections);
  };

  // Get count of selected options for an image
  const getSelectedCount = (imageId: number) => {
    return selections.get(imageId)?.size || 0;
  };

  // Check if an option is selected
  const isOptionSelected = (imageId: number, option: string) => {
    return selections.get(imageId)?.has(option) || false;
  };

  // Format selections for submission
  const formatSelectionsForSubmit = () => {
    const formattedSelections: Array<{ imageId: number; selectedOptions: string[] }> = [];
    
    selections.forEach((options, imageId) => {
      formattedSelections.push({
        imageId,
        selectedOptions: Array.from(options)
      });
    });
    
    return formattedSelections;
  };

  // Handle submit
  const handleSubmit = () => {
    onSubmit(formatSelectionsForSubmit());
  };

  // Check if options are still loading
  const isLoading = enhancementData.status === 'processing' && 
    enhancementData.images.some(img => !img.options || img.options.length === 0);

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Industry</h3>
            <p className="text-sm text-muted-foreground">{enhancementData.industry}</p>
          </div>
          <div className="text-right">
            <h3 className="font-medium">Total Credits</h3>
            <p className="text-sm text-muted-foreground">{totalCredits} credit{totalCredits !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Processing your images and generating enhancement options...
          </p>
        </div>
      ) : (
        <>
          <Alert className="mb-6">
            <AlertTitle>Selection Guidelines</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Each image can have up to 5 enhancement options selected</li>
                <li>Each selected option costs 1 credit</li>
                <li>For each selected option, you'll receive 2 enhanced versions of your image</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {enhancementData.images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="sm:flex">
                  <div className="sm:w-1/3 h-64 sm:h-auto relative">
                    <img 
                      src={image.imageUrl} 
                      alt="Original product" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="sm:w-2/3 p-6">
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Enhancement Options</h3>
                      <p className="text-sm text-muted-foreground">
                        Selected: {getSelectedCount(image.id)}/5
                      </p>
                    </div>
                    
                    {image.options && image.options.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {image.options.map((option, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`${image.id}-option-${index}`}
                              checked={isOptionSelected(image.id, option)}
                              disabled={
                                getSelectedCount(image.id) >= 5 && 
                                !isOptionSelected(image.id, option)
                              }
                              onCheckedChange={() => toggleOption(image.id, option)}
                            />
                            <label 
                              htmlFor={`${image.id}-option-${index}`}
                              className="text-sm leading-tight cursor-pointer"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        No enhancement options available for this image.
                      </p>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <div>
              <p className="text-sm text-muted-foreground">
                Total: {totalCredits} credit{totalCredits !== 1 ? 's' : ''}
              </p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || totalCredits === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing...
                </>
              ) : (
                `Enhance Images (${totalCredits} credit${totalCredits !== 1 ? 's' : ''})`
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}