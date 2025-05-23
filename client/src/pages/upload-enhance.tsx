import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, Sparkles, Check, Loader2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UploadEnhancePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [industry, setIndustry] = useState("");
  const [productType, setProductType] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, name: "Upload", description: "Select Images" },
    { id: 2, name: "Details", description: "Product Info" },
    { id: 3, name: "Enhance", description: "AI Processing" },
    { id: 4, name: "Download", description: "Get Results" }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    setSelectedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(4);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <Navbar freeCredits={0} paidCredits={0} />
      
      {/* Fixed Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep 
                      ? "bg-green-500 text-white" 
                      : step.id === currentStep 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-600"
                  }`}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="ml-3 text-sm">
                    <p className={`font-medium ${step.id <= currentStep ? "text-gray-900" : "text-gray-500"}`}>
                      {step.name}
                    </p>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-0.5 mx-4 ${
                    step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-screen-xl mx-auto px-4 py-8 mt-32">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Product Images
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your product images with AI-powered enhancements. 
            Get professional-quality results in minutes.
          </p>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Industry Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Product Information
              </CardTitle>
              <CardDescription>
                Help us understand your brand and products for better AI enhancement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="jewelry">Jewelry & Accessories</SelectItem>
                    <SelectItem value="sports">Sports & Fitness</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productType">Product Type</Label>
                <Input
                  id="productType"
                  placeholder="e.g., Sneakers, Smartphone, Coffee Mug"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandDescription">Brand Description (Optional)</Label>
                <Textarea
                  id="brandDescription"
                  placeholder="Describe your brand style, target audience, or specific enhancement preferences..."
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Image Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Select up to 5 high-quality product images (JPEG, PNG, WebP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop images here or click to browse
                </h3>
                <p className="text-gray-500 mb-4">
                  Maximum 5 images, up to 10MB each
                </p>
                <Button variant="outline" type="button">
                  Choose Files
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Preview Grid */}
        {selectedFiles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Selected Images ({selectedFiles.length}/5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons Section */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          >
            Previous Step
          </Button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
          
          <Button 
            onClick={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : handleSubmit()}
            disabled={selectedFiles.length === 0 || (currentStep === 2 && !industry)}
          >
            {currentStep === 3 ? "Start Enhancement" : "Next Step"}
          </Button>
        </div>

        {/* Submit Section with Prominent CTA */}
        <Card className="text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Images?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our AI will enhance your product images with professional lighting, 
              color correction, and background optimization to make them stand out.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
              disabled={selectedFiles.length === 0 || !industry}
              onClick={handleSubmit}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Enhance {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Your Images
            </h3>
            <p className="text-gray-600 mb-4">
              Our AI is working its magic on your product images. This may take a few minutes.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}