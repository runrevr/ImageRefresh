import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface EnhancementImage {
  id: number;
  originalImagePath: string;
  imageUrl: string;
  options: string[];
  selectedOptions: string[];
}

interface EnhancementOptionsProps {
  enhancementData: {
    id: number;
    status: string;
    industry: string;
    creditsUsed: number;
    images: EnhancementImage[];
    webhookRequestId?: string;
  };
  isLoading: boolean;
  onSubmit: (selections: Array<{ imageId: number; selectedOptions: string[] }>) => void;
  isPending: boolean;
}

const MAX_SELECTIONS_PER_IMAGE = 5;

export default function EnhancementOptions({
  enhancementData,
  isLoading,
  onSubmit,
  isPending
}: EnhancementOptionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize selected options from passed data
  const [selections, setSelections] = useState<{[imageId: number]: string[]}>(() => {
    const initialSelections: {[imageId: number]: string[]} = {};
    enhancementData.images.forEach(img => {
      initialSelections[img.id] = img.selectedOptions || [];
    });
    return initialSelections;
  });

  // Calculate total credits needed
  const totalSelectionsCount = Object.values(selections).reduce(
    (count, options) => count + options.length, 0
  );

  // Toggle option selection
  const toggleOption = (imageId: number, option: string) => {
    setSelections(prevSelections => {
      const currentSelections = prevSelections[imageId] || [];
      
      // If option is already selected, remove it
      if (currentSelections.includes(option)) {
        return {
          ...prevSelections,
          [imageId]: currentSelections.filter(opt => opt !== option)
        };
      }
      
      // If maximum selections for this image is reached, show warning
      if (currentSelections.length >= MAX_SELECTIONS_PER_IMAGE) {
        toast({
          title: "Maximum options reached",
          description: `You can select up to ${MAX_SELECTIONS_PER_IMAGE} options per image`,
          variant: "destructive"
        });
        return prevSelections;
      }
      
      // Add the option
      return {
        ...prevSelections,
        [imageId]: [...currentSelections, option]
      };
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Format selections for API
    const formattedSelections = Object.entries(selections).map(([imageId, selectedOptions]) => ({
      imageId: parseInt(imageId),
      selectedOptions
    }));
    
    onSubmit(formattedSelections);
  };

  // Calculate available credits
  const availableCredits = user ? user.paidCredits : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Select Enhancement Options</h2>
          <p className="text-muted-foreground mt-1">
            Choose up to {MAX_SELECTIONS_PER_IMAGE} options per image. Each option costs 1 credit.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 p-4 border rounded-md bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Credits:</span>
            <span className="font-semibold">{availableCredits}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium">Credits Needed:</span>
            <span className="font-semibold">{totalSelectionsCount}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading options...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {enhancementData.images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="grid md:grid-cols-12 gap-2">
                  <div className="md:col-span-3 p-4">
                    <img 
                      src={image.imageUrl} 
                      alt="Original product" 
                      className="w-full rounded-md object-cover aspect-square" 
                    />
                    <p className="text-sm text-center mt-2">
                      Selected: {selections[image.id]?.length || 0}/{MAX_SELECTIONS_PER_IMAGE}
                    </p>
                  </div>
                  
                  <div className="md:col-span-9">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Enhancement Options</h3>
                      
                      {image.options.length === 0 ? (
                        <p className="text-muted-foreground italic">
                          No enhancement options available for this image
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                          {image.options.map((option) => (
                            <div key={option} className="flex items-start space-x-2">
                              <Checkbox 
                                id={`${image.id}-${option}`}
                                checked={selections[image.id]?.includes(option) || false}
                                onCheckedChange={() => toggleOption(image.id, option)}
                              />
                              <Label 
                                htmlFor={`${image.id}-${option}`}
                                className="leading-tight cursor-pointer"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        
          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSubmit}
              disabled={isPending || totalSelectionsCount === 0 || totalSelectionsCount > availableCredits}
              className="min-w-[150px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Proceed (${totalSelectionsCount} credits)`
              )}
            </Button>
          </div>
          
          {totalSelectionsCount > availableCredits && (
            <div className="mt-2 text-right text-destructive text-sm">
              You need {totalSelectionsCount - availableCredits} more credits to proceed
            </div>
          )}
        </>
      )}
    </div>
  );
}