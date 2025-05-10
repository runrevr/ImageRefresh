import { useState, useRef, FormEvent, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";

// Define types for our product enhancement data
type EnhancementImage = {
  id: number;
  originalImageUrl: string;
  options?: {
    [key: string]: {
      name: string;
      description: string;
    }
  }
};

type Enhancement = {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  industry: string;
  webhookId?: string;
  images: EnhancementImage[];
};

type EnhancementResult = {
  imageId: number;
  optionKey: string;
  resultImage1Url: string;
  resultImage2Url: string;
};

type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function ProductEnhancementWebhookPage() {
  const { user: authUser } = useAuth();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [industry, setIndustry] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentEnhancement, setCurrentEnhancement] = useState<Enhancement | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{imageId: number, imageIndex: number, optionKey: string}[]>([]);
  const [isSubmittingSelections, setIsSubmittingSelections] = useState(false);
  const [enhancementResults, setEnhancementResults] = useState<EnhancementResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Update local user state when auth user changes
  useEffect(() => {
    if (authUser) {
      setUserCredits({
        id: authUser.id,
        freeCreditsUsed: authUser.freeCreditsUsed,
        paidCredits: authUser.paidCredits
      });
    }
  }, [authUser]);
  
  // Default to 0 if userCredits is not available
  const freeCredits = userCredits && !userCredits.freeCreditsUsed ? 1 : 0;
  const paidCredits = userCredits?.paidCredits || 0;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    
    // Limit to 5 files total
    if (selectedFiles.length + newFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "You can only upload up to 5 images at a time.",
        variant: "destructive"
      });
      return;
    }
    
    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove a file from the selection
  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all selected files
  const clearFiles = () => {
    // Revoke all object URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles([]);
    setPreviewUrls([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!industry.trim()) {
      toast({
        title: "Industry required",
        description: "Please enter your industry.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("industry", industry);
      
      // Append all selected files
      selectedFiles.forEach(file => {
        formData.append("images", file);
      });
      
      // Send to API
      const response = await fetch("/api/product-enhancement/start", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error uploading images");
      }
      
      const data = await response.json();
      setCurrentEnhancement(data);
      setActiveTab("options");
      
      // Start polling for processing status
      pollEnhancementStatus(data.id);
      
      // Clear the form
      clearFiles();
      
      toast({
        title: "Upload successful",
        description: "Your images are being processed.",
      });
    } catch (error: any) {
      toast({
        title: "Upload error",
        description: error.message || "Error uploading images",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for enhancement status updates
  const pollEnhancementStatus = async (enhancementId: number) => {
    try {
      const response = await apiRequest("GET", `/api/product-enhancement/${enhancementId}`);
      const data = await response.json();
      
      setCurrentEnhancement(data);
      
      // If still processing, poll again after delay
      if (data.status === "processing") {
        setTimeout(() => pollEnhancementStatus(enhancementId), 3000);
      }
    } catch (error) {
      console.error("Error polling enhancement status:", error);
    }
  };

  // Toggle option selection
  const toggleOption = (imageId: number, imageIndex: number, optionKey: string) => {
    setSelectedOptions(prev => {
      // Check if this option is already selected
      const existingIndex = prev.findIndex(opt => 
        opt.imageId === imageId && opt.optionKey === optionKey
      );
      
      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        // Add new selection
        return [...prev, {imageId, imageIndex, optionKey}];
      }
    });
  };

  // Submit the selected options
  const submitSelections = async () => {
    if (!currentEnhancement) return;
    
    if (selectedOptions.length === 0) {
      toast({
        title: "No options selected",
        description: "Please select at least one enhancement option.",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough credits
    if (userCredits && userCredits.paidCredits < selectedOptions.length) {
      toast({
        title: "Insufficient credits",
        description: `You need ${selectedOptions.length} credits but only have ${userCredits.paidCredits}. Please purchase more credits.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmittingSelections(true);
      
      const selections = selectedOptions.map(option => ({
        imageIndex: option.imageIndex,
        optionKey: option.optionKey
      }));
      
      const response = await apiRequest("POST", `/api/product-enhancement/${currentEnhancement.id}/select`, {
        selections
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error submitting selections");
      }
      
      const data = await response.json();
      setEnhancementResults(data.results);
      setActiveTab("results");
      
      // Update user's credits
      if (userCredits) {
        setUserCredits({
          ...userCredits,
          paidCredits: userCredits.paidCredits - selectedOptions.length
        });
      }
      
      toast({
        title: "Selections submitted successfully",
        description: "Your enhanced images are ready.",
      });
    } catch (error: any) {
      toast({
        title: "Submission error",
        description: error.message || "Error submitting selections",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingSelections(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      
      <main className="container mx-auto px-4 py-10 flex-grow">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Product Enhancement</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">1. Upload Images</TabsTrigger>
              <TabsTrigger value="options" disabled={!currentEnhancement}>2. Select Options</TabsTrigger>
              <TabsTrigger value="results" disabled={enhancementResults.length === 0}>3. View Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="p-4 border rounded-lg mt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="industry">Your Industry</Label>
                  <Input 
                    id="industry" 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)} 
                    placeholder="Enter your industry (e.g., Fashion, Technology, Food)"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="images">Upload Product Images (Max 5)</Label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 mt-1 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                    <input
                      type="file"
                      id="images"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                  </div>
                </div>
                
                {previewUrls.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Selected Images ({previewUrls.length}/5)</h3>
                      <Button type="button" variant="outline" onClick={clearFiles}>Clear All</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button 
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUploading || selectedFiles.length === 0}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : "Submit Images"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="options" className="p-4 border rounded-lg mt-4">
              {currentEnhancement && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Select Enhancement Options</h2>
                    <div className="text-sm">
                      <span className="font-medium">Available Credits:</span> {paidCredits}
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    Select the enhancement options you would like to apply to your images. 
                    Each selection costs 1 credit.
                  </p>
                  
                  {currentEnhancement.status === "processing" ? (
                    <div className="text-center py-12">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                      <p className="mt-4 text-lg font-medium">Processing your images...</p>
                      <p className="text-gray-500">This may take a minute or two.</p>
                    </div>
                  ) : currentEnhancement.status === "failed" ? (
                    <div className="text-center py-12">
                      <XCircle className="mx-auto h-12 w-12 text-red-500" />
                      <p className="mt-4 text-lg font-medium">Enhancement failed</p>
                      <p className="text-gray-500">There was an error processing your images. Please try again.</p>
                      <Button 
                        onClick={() => setActiveTab("upload")} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-8">
                        {currentEnhancement.images.map((image, imageIndex) => (
                          <Card key={image.id} className="overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4">
                                <h3 className="text-lg font-medium mb-2">Original Image</h3>
                                <img 
                                  src={image.originalImageUrl} 
                                  alt="Original product" 
                                  className="w-full h-auto rounded-md"
                                />
                              </div>
                              
                              <div className="p-4 md:col-span-2 bg-gray-50">
                                <h3 className="text-lg font-medium mb-2">Enhancement Options</h3>
                                
                                {image.options && Object.keys(image.options).length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(image.options).map(([key, option]) => {
                                      const isSelected = selectedOptions.some(
                                        opt => opt.imageId === image.id && opt.optionKey === key
                                      );
                                      
                                      return (
                                        <div 
                                          key={key}
                                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            isSelected 
                                              ? 'border-primary bg-primary/5' 
                                              : 'border-gray-200 hover:bg-gray-100'
                                          }`}
                                          onClick={() => toggleOption(image.id, imageIndex, key)}
                                        >
                                          <div className="flex justify-between">
                                            <h4 className="font-medium">{option.name}</h4>
                                            {isSelected && (
                                              <CheckCircle2 className="h-5 w-5 text-primary" />
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {option.description}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">No enhancement options available for this image.</p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-6">
                        <div>
                          <p className="text-sm font-medium">
                            {selectedOptions.length} options selected 
                            ({selectedOptions.length} {selectedOptions.length === 1 ? 'credit' : 'credits'})
                          </p>
                        </div>
                        <Button 
                          onClick={submitSelections} 
                          disabled={isSubmittingSelections || selectedOptions.length === 0}
                        >
                          {isSubmittingSelections ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : "Generate Enhanced Images"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="results" className="p-4 border rounded-lg mt-4">
              {enhancementResults.length > 0 ? (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold">Your Enhanced Images</h2>
                  
                  <div className="grid grid-cols-1 gap-8">
                    {enhancementResults.map((result, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                          <h3 className="text-lg font-medium mb-4">{
                            currentEnhancement?.images.find(img => img.id === result.imageId)?.options?.[result.optionKey]?.name || 
                            `Enhancement ${index + 1}`
                          }</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <img 
                                src={result.resultImage1Url} 
                                alt="Enhanced image 1" 
                                className="w-full h-auto rounded-lg"
                              />
                              <p className="text-sm text-center mt-2 text-gray-600">Version 1</p>
                            </div>
                            <div>
                              <img 
                                src={result.resultImage2Url} 
                                alt="Enhanced image 2" 
                                className="w-full h-auto rounded-lg"
                              />
                              <p className="text-sm text-center mt-2 text-gray-600">Version 2</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-center space-x-4">
                            <a 
                              href={result.resultImage1Url} 
                              download 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              Download Version 1
                            </a>
                            <a 
                              href={result.resultImage2Url} 
                              download 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 text-sm font-medium"
                            >
                              Download Version 2
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => setActiveTab("upload")}>
                      Start New Enhancement
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg font-medium">No results yet</p>
                  <p className="text-gray-500">Select and submit enhancement options to see results here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}