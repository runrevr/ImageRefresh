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
    <div>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;800&family=Montserrat:wght@400;500&display=swap" 
        rel="stylesheet" 
      />
      
      <style>{`
        :root {
          --primary: #0D7877;
          --secondary: #3DA5D9;
          --accent: #C1F50A;
          --neutral: #333333;
          --light: #F2F4F6;
        }
        
        .brand-font-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .brand-font-body {
          font-family: 'Montserrat', sans-serif;
        }
        
        .brand-bg-primary { background-color: var(--primary); }
        .brand-bg-secondary { background-color: var(--secondary); }
        .brand-bg-accent { background-color: var(--accent); }
        .brand-bg-light { background-color: var(--light); }
        
        .brand-text-primary { color: var(--primary); }
        .brand-text-secondary { color: var(--secondary); }
        .brand-text-accent { color: var(--accent); }
        .brand-text-neutral { color: var(--neutral); }
        
        .brand-border-primary { border-color: var(--primary); }
        .brand-border-secondary { border-color: var(--secondary); }
        .brand-border-accent { border-color: var(--accent); }
        
        .brand-gradient-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }
        
        .brand-gradient-accent {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%);
        }
        
        .brand-button-primary {
          background: var(--primary);
          color: white;
          transition: all 0.3s ease;
        }
        
        .brand-button-primary:hover {
          background: var(--secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 120, 119, 0.3);
        }
        
        .brand-button-accent {
          background: var(--accent);
          color: var(--neutral);
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .brand-button-accent:hover {
          background: #A8D209;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(193, 245, 10, 0.3);
        }
        
        .brand-card {
          background: white;
          border: 2px solid var(--light);
          transition: all 0.3s ease;
        }
        
        .brand-card:hover {
          border-color: var(--secondary);
          box-shadow: 0 8px 25px rgba(61, 165, 217, 0.15);
        }
        
        .progress-step-active {
          background: var(--primary);
          color: white;
        }
        
        .progress-step-completed {
          background: var(--accent);
          color: var(--neutral);
        }
        
        .progress-step-inactive {
          background: var(--light);
          color: var(--neutral);
        }
        
        .upload-zone {
          border: 2px dashed var(--light);
          transition: all 0.3s ease;
        }
        
        .upload-zone:hover {
          border-color: var(--secondary);
          background-color: rgba(61, 165, 217, 0.05);
        }
        
        .upload-zone.active {
          border-color: var(--primary);
          background-color: rgba(13, 120, 119, 0.05);
        }
      `}</style>
      
      <div className="min-h-screen brand-bg-light">
        <Navbar freeCredits={0} paidCredits={0} />
      
      {/* Fixed Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium brand-font-body ${
                    step.id < currentStep 
                      ? "progress-step-completed" 
                      : step.id === currentStep 
                        ? "progress-step-active" 
                        : "progress-step-inactive"
                  }`}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="ml-3 text-sm brand-font-body">
                    <p className={`font-medium ${step.id <= currentStep ? "brand-text-neutral" : "text-gray-500"}`}>
                      {step.name}
                    </p>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-0.5 mx-4 ${
                    step.id < currentStep ? "brand-bg-accent" : "bg-gray-200"
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
          <h1 className="text-4xl brand-font-heading font-extrabold brand-text-neutral mb-4">
            Upload Your Product Images
          </h1>
          <p className="text-xl brand-font-body brand-text-neutral max-w-2xl mx-auto">
            Transform your product images with AI-powered enhancements. 
            Get professional-quality results in minutes.
          </p>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Industry Information Form */}
          <Card className="brand-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 brand-font-heading font-semibold brand-text-neutral">
                <Sparkles className="h-5 w-5 brand-text-primary" />
                Product Information
              </CardTitle>
              <CardDescription className="brand-font-body text-gray-600">
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
          <Card className="brand-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 brand-font-heading font-semibold brand-text-neutral">
                <Camera className="h-5 w-5 brand-text-secondary" />
                Upload Images
              </CardTitle>
              <CardDescription className="brand-font-body text-gray-600">
                Select up to 5 high-quality product images (JPEG, PNG, WebP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`upload-zone rounded-lg p-8 text-center cursor-pointer ${
                  dragActive ? "active" : ""
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg brand-font-heading font-semibold brand-text-neutral mb-2">
                  Drop images here or click to browse
                </h3>
                <p className="text-gray-500 brand-font-body mb-4">
                  Maximum 5 images, up to 10MB each
                </p>
                <Button variant="outline" type="button" className="brand-button-primary border-none">
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
          <Card className="mb-8 brand-card">
            <CardHeader>
              <CardTitle className="brand-font-heading font-semibold brand-text-neutral">Selected Images ({selectedFiles.length}/5)</CardTitle>
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
            className="brand-font-body border-2 brand-border-primary brand-text-primary hover:brand-bg-primary hover:text-white"
          >
            Previous Step
          </Button>
          
          <div className="text-sm text-gray-500 brand-font-body">
            Step {currentStep} of {steps.length}
          </div>
          
          <Button 
            onClick={() => currentStep < 3 ? setCurrentStep(currentStep + 1) : handleSubmit()}
            disabled={selectedFiles.length === 0 || (currentStep === 2 && !industry)}
            className="brand-button-primary brand-font-body font-medium"
          >
            {currentStep === 3 ? "Start Enhancement" : "Next Step"}
          </Button>
        </div>

        {/* Submit Section with Prominent CTA */}
        <Card className="text-center brand-card" style={{ background: 'linear-gradient(135deg, rgba(13, 120, 119, 0.1) 0%, rgba(61, 165, 217, 0.1) 100%)', borderColor: 'var(--secondary)' }}>
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl brand-font-heading font-bold brand-text-neutral mb-4">
              Ready to Transform Your Images?
            </h3>
            <p className="brand-text-neutral brand-font-body mb-6 max-w-2xl mx-auto">
              Our AI will enhance your product images with professional lighting, 
              color correction, and background optimization to make them stand out.
            </p>
            <Button 
              size="lg" 
              className="brand-button-accent px-8 py-3 text-lg brand-font-body font-medium"
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
    </div>
  );
}