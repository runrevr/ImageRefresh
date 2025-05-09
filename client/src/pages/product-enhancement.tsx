import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// Import product enhancement specific components
import MultiImageUploader from "@/components/product-enhancement/MultiImageUploader";
import EnhancementOptions from "@/components/product-enhancement/EnhancementOptions";
import EnhancementResults from "@/components/product-enhancement/EnhancementResults";

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
  
  // State for industry dialog
  const [showIndustryDialog, setShowIndustryDialog] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  
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
      setProcessingImages(false);
      toast({
        title: "Enhancement created",
        description: "Your images have been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      setProcessingImages(false);
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
    onError: (error: any) => {
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

    // Close the industry dialog
    setShowIndustryDialog(false);
    // Show processing indicator
    setProcessingImages(true);

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
    if (files.length > 0 && files.length <= 5) {
      setUploadedFiles(files);
      // Show industry dialog after files are selected
      setShowIndustryDialog(true);
    } else if (files.length > 5) {
      toast({
        title: "Too many images",
        description: "Please select a maximum of 5 images.",
        variant: "destructive",
      });
    }
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
    setProcessingImages(false);
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
          
          <div className="max-w-3xl mx-auto mt-8 text-left bg-muted/30 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">How It Works:</h2>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold mr-2">1</span>
                <span>Upload 1-5 product images you want to enhance</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold mr-2">2</span>
                <span>Tell us your industry for tailored enhancement options</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold mr-2">3</span>
                <span>Select enhancement options for each image (each option costs 1 credit)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold mr-2">4</span>
                <span>Receive 2 enhanced versions for each option you select</span>
              </li>
            </ol>
          </div>
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
                {processingImages ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Processing Your Images</h3>
                    <p className="text-center text-muted-foreground mb-4 max-w-lg">
                      Your images are being prepared for enhancement. This usually takes less than a minute.
                    </p>
                    <div className="bg-muted/30 p-4 rounded-lg max-w-lg w-full">
                      <h4 className="font-medium mb-2">What happens next?</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Our system analyzes your product images and industry</li>
                        <li>We'll generate enhancement options tailored to your specific products</li>
                        <li>You'll select which enhancements to apply (each costs 1 credit)</li>
                        <li>You'll receive 2 high-quality enhanced versions for each option selected</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-primary/5 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold mb-1">Get Started with Product Enhancement</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload 1-5 product images below. For best results, use high-quality images with good lighting.
                      </p>
                    </div>
                    
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
                )}
              </CardContent>
            </Card>
            
            {/* Industry Dialog */}
            <Dialog open={showIndustryDialog} onOpenChange={setShowIndustryDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Tell us about your industry</DialogTitle>
                  <DialogDescription>
                    We'll use this information to provide enhancement options tailored to your products.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Industry</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E.g., Fashion, Electronics, Food & Beverage" 
                              {...field} 
                              autoFocus
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="mt-6">
                      <Button 
                        type="submit"
                        disabled={isSubmittingEnhancement}
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
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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