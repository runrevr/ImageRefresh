import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertTriangle, Loader2 } from "lucide-react";

// Import product-enhancement specific components 
// (we'll create these next)
import MultiImageUploader from "@/components/product-enhancement/MultiImageUploader";
import EnhancementOptions from "@/components/product-enhancement/EnhancementOptions";
import EnhancementResults from "@/components/product-enhancement/EnhancementResults";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define product enhancement types
interface EnhancementImage {
  id: number;
  originalImagePath: string;
  imageUrl: string;
  options: string[];
  selectedOptions: string[];
  resultImagePaths?: string[];
  resultImageUrls?: string[];
}

interface EnhancementData {
  id: number;
  status: string;
  industry: string;
  creditsUsed: number;
  images: EnhancementImage[];
  webhookRequestId?: string;
  createdAt?: string;
}

// Define steps in the product enhancement workflow
enum EnhancementStep {
  Upload = "upload",
  SelectOptions = "select-options",
  Results = "results"
}

// Form schema for industry input
const industryFormSchema = z.object({
  industry: z.string().min(1, { message: "Please enter your industry" })
});

export default function ProductEnhancement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<EnhancementStep>(EnhancementStep.Upload);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [enhancementId, setEnhancementId] = useState<number | null>(null);
  
  // Form for industry input
  const form = useForm<z.infer<typeof industryFormSchema>>({
    resolver: zodResolver(industryFormSchema),
    defaultValues: {
      industry: ""
    }
  });

  // Query to fetch enhancement data when enhancementId is set
  const {
    data: enhancementData,
    isLoading: isEnhancementLoading,
    error: enhancementError,
    refetch: refetchEnhancement
  } = useQuery({
    queryKey: [`/api/product-enhancement/${enhancementId}`],
    enabled: enhancementId !== null,
    refetchInterval: currentStep === EnhancementStep.SelectOptions ? 5000 : false
  });

  // Mutation to create a new enhancement
  const {
    mutate: submitEnhancement,
    isPending: isSubmittingEnhancement
  } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/product-enhancement`, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process enhancement");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setEnhancementId(data.enhancementId);
      setCurrentStep(EnhancementStep.SelectOptions);
      toast({
        title: "Enhancement created",
        description: "Your images have been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to process images: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation to submit selected options
  const {
    mutate: submitSelections,
    isPending: isSubmittingSelections
  } = useMutation({
    mutationFn: async (selections: { 
      selections: Array<{ imageId: number; selectedOptions: string[] }>
    }) => {
      const response = await fetch(`/api/product-enhancement/${enhancementId}/selections`, {
        method: "POST",
        body: JSON.stringify(selections),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit selections");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentStep(EnhancementStep.Results);
      toast({
        title: "Selections submitted",
        description: "Your selections are being processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit selections: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle industry form submission
  const onSubmit = (values: z.infer<typeof industryFormSchema>) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "Please select a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("industry", values.industry);
    
    // Add user ID if authenticated
    if (user) {
      formData.append("userId", user.id.toString());
    }
    
    // Add all files
    uploadedFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Submit the enhancement
    submitEnhancement(formData);
  };

  // Handle file uploads
  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };

  // Handle option selection submission
  const handleSubmitSelections = (selections: Array<{ imageId: number; selectedOptions: string[] }>) => {
    if (!enhancementId) return;

    // Check if any selections were made
    const hasSelections = selections.some(selection => selection.selectedOptions.length > 0);
    if (!hasSelections) {
      toast({
        title: "No options selected",
        description: "Please select at least one option.",
        variant: "destructive",
      });
      return;
    }

    submitSelections({ selections });
  };

  // Handle starting over
  const handleStartOver = () => {
    setCurrentStep(EnhancementStep.Upload);
    setUploadedFiles([]);
    setEnhancementId(null);
    form.reset();
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Product Enhancement</h1>
          <p className="text-muted-foreground mt-2">
            Upload product images and get professional enhancement options tailored to your industry
          </p>
        </div>

        <Tabs 
          value={currentStep} 
          onValueChange={(value) => {
            // Only allow going back to previous steps
            if (
              (value === EnhancementStep.Upload) || 
              (value === EnhancementStep.SelectOptions && enhancementId) ||
              (value === EnhancementStep.Results && enhancementData && typeof enhancementData === 'object' && enhancementData !== null && 
                'images' in enhancementData && Array.isArray(enhancementData.images) && 
                enhancementData.images.some((img: any) => img.resultImagePaths && img.resultImagePaths.length > 0))
            ) {
              setCurrentStep(value as EnhancementStep);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={EnhancementStep.Upload}>
              1. Upload Images
            </TabsTrigger>
            <TabsTrigger 
              value={EnhancementStep.SelectOptions}
              disabled={!enhancementId}
            >
              2. Select Options
            </TabsTrigger>
            <TabsTrigger 
              value={EnhancementStep.Results}
              disabled={!(enhancementData && typeof enhancementData === 'object' && enhancementData !== null && 
                'images' in enhancementData && Array.isArray(enhancementData.images) && 
                enhancementData.images.some((img: any) => img.resultImagePaths && img.resultImagePaths.length > 0))}
            >
              3. View Results
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Upload Images */}
          <TabsContent value={EnhancementStep.Upload} className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your industry (e.g., Fashion, Electronics, Food)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-6">
                      <MultiImageUploader 
                        onFilesSelected={handleFilesSelected}
                        maxFiles={5}
                      />
                      
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            {uploadedFiles.length} {uploadedFiles.length === 1 ? 'image' : 'images'} selected
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map((file, index) => (
                              <div 
                                key={index}
                                className="relative w-24 h-24 border rounded overflow-hidden"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isSubmittingEnhancement || uploadedFiles.length === 0}
                      >
                        {isSubmittingEnhancement ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Processing...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Select Options */}
          <TabsContent value={EnhancementStep.SelectOptions} className="mt-6">
            {isEnhancementLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-center text-muted-foreground">
                  Processing your images and generating enhancement options...
                </p>
              </div>
            ) : enhancementError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load enhancement options. Please try again.
                </AlertDescription>
                <div className="mt-4">
                  <Button variant="outline" onClick={handleStartOver}>
                    Start Over
                  </Button>
                </div>
              </Alert>
            ) : enhancementData ? (
              <EnhancementOptions
                enhancementData={enhancementData as EnhancementData}
                isLoading={false}
                onSubmit={handleSubmitSelections}
                isPending={isSubmittingSelections}
              />
            ) : null}
          </TabsContent>

          {/* Step 3: Results */}
          <TabsContent value={EnhancementStep.Results} className="mt-6">
            {enhancementData && typeof enhancementData === 'object' && enhancementData !== null && 'images' in enhancementData && (
              <EnhancementResults
                enhancementData={enhancementData as EnhancementData}
                isLoading={isEnhancementLoading}
                onStartOver={handleStartOver}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}