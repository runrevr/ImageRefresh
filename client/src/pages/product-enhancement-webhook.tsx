import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import shampooOriginal from "@assets/shampoo 3.png";
import shampooEnhanced from "@assets/shampoo 4.png";
import sweatshirtOriginal from "@assets/sweatshirt.png";
import sweatshirtEnhanced from "@assets/sweatshirt 2.png";

// Type definitions
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

type EnhancementResult = {
  imageId: number;
  optionKey: string;
  optionName: string;
  resultImage1Path: string;
  resultImage2Path: string;
  description?: string;
};

// Top announcement banner
const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-secondary-500 text-white p-4 text-center font-medium">
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

// Header component with logo and navigation
const Header = () => {
  return (
    <header className="bg-white">
      <div className="container mx-auto p-6 flex items-center justify-between">
        <div className="text-2xl font-heading text-primary-600">ImageRefresh</div>
        <nav className="hidden md:flex space-x-6 font-medium">
          <a href="#features" className="hover:text-primary-600">Features</a>
          <a href="#showcase" className="hover:text-primary-600">Showcase</a>
          <a href="#demo" className="hover:text-primary-600">Demo</a>
          <a href="#faq" className="hover:text-primary-600">FAQ</a>
        </nav>
        <a href="#demo" className="bg-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary-600">Try It Free</a>
      </div>
    </header>
  );
};

// Hero section with main value proposition
const HeroSection = () => {
  return (
    <section className="container mx-auto text-center py-20">
      <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-primary-600">
        Studio-quality product photos—no studio needed
      </h1>
      <p className="text-lg text-dark mb-8 max-w-2xl mx-auto">
        Use AI as your virtual photo studio: generate amazing visuals from simple snaps—perfect for your store, ads, and socials.
      </p>
      <a 
        href="#demo" 
        className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700 transition"
      >
        Upload Your Photo
      </a>
    </section>
  );
};

// Features section
const FeaturesSection = () => {
  return (
    <section id="features" className="bg-white py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-10">Your All-in-One AI Photo Studio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="font-bold text-xl mb-2 text-primary-700">Background Generation</h3>
            <p className="text-body">Create brand-aligned backgrounds instantly—no green screen required.</p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-2 text-primary-700">Lighting & Retouching</h3>
            <p className="text-body">Auto-enhance color, contrast, and clarity for a polished, professional look.</p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="font-bold text-xl mb-2 text-primary-700">Creative Prompts</h3>
            <p className="text-body">Get multiple scene ideas tailored to your product—pick your favorite and go!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Showcase Before/After section
const ShowcaseSection = () => {
  return (
    <section id="showcase" className="py-16 bg-[#f8fafa]">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-8">See the Transformation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={shampooOriginal} alt="Before" className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-secondary-500 text-white px-2 py-1 text-sm rounded">Before</span>
          </div>
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={shampooEnhanced} alt="After" className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 text-sm rounded">After</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={sweatshirtOriginal} alt="Before" className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-secondary-500 text-white px-2 py-1 text-sm rounded">Before</span>
          </div>
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={sweatshirtEnhanced} alt="After" className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 text-sm rounded">After</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Demo 3-step section - This is where the actual upload functionality lives
const DemoSection = ({ onImagesSelected, isUploading }: { onImagesSelected: (files: File[]) => void, isUploading: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

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

  const borderClass = dragging ? "border-primary-500" : "border-primary-200 hover:border-primary-400";

  return (
    <section id="demo" className="bg-white py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">Try It Now In 3 Steps</h2>
        
        <div className="flex flex-col md:flex-row items-stretch md:space-x-8 space-y-8 md:space-y-0">
          {/* Step 1 */}
          <div className="flex-1 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-primary-600 text-white text-xl font-semibold rounded-full mx-auto mb-6">1</div>
            <h3 className="text-xl font-bold mb-3 text-primary-700">Upload Your Photos</h3>
            <p className="mb-6 text-gray-600">Drag & drop or click to select up to 5 product images.</p>
            <div 
              className={`border-2 border-dashed ${borderClass} rounded-lg p-6 text-center transition-all duration-200 mb-4`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="py-4">
                  <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-primary-600 rounded-full mx-auto mb-3"></div>
                  <p className="text-primary-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-500">Drag & Drop Images Here</p>
                  <button 
                    className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Choose Files
                  </button>
                </>
              )}
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
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-0 right-0 bg-primary-600 text-white text-xs px-2 py-1 rounded-tl">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Step 2 */}
          <div className="flex-1 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-semibold rounded-full mx-auto mb-6">2</div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">Choose Your Industry</h3>
            <p className="mb-6 text-gray-600">Select your product category to get optimized enhancement options.</p>
            <div className="space-y-2">
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                defaultValue=""
              >
                <option value="" disabled>Select your industry...</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="beauty">Beauty & Cosmetics</option>
                <option value="home">Home & Furniture</option>
                <option value="electronics">Electronics</option>
                <option value="food">Food & Beverage</option>
                <option value="jewelry">Jewelry & Accessories</option>
                <option value="sports">Sports & Outdoor</option>
              </select>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex-1 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-semibold rounded-full mx-auto mb-6">3</div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">Get Amazing Results</h3>
            <p className="mb-6 text-gray-600">Choose from AI-suggested enhancements tailored to your products.</p>
            <button className="bg-secondary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary-600 transition shadow-sm">
              Start Enhancement
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials section
const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <blockquote className="p-6 bg-primary-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-primary-500">
            <div className="text-primary-500 text-3xl mb-4">"</div>
            <p className="italic mb-6 text-gray-700">"I saved $2,000 on a single shoot — and the results look even better than a professional studio!"</p>
            <footer className="font-medium text-primary-700">— Alex, Boutique Owner</footer>
          </blockquote>
          
          <blockquote className="p-6 bg-primary-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-primary-500">
            <div className="text-primary-500 text-3xl mb-4">"</div>
            <p className="italic mb-6 text-gray-700">"As a one-person team, this tool is a game-changer. I can create professional product photos in minutes."</p>
            <footer className="font-medium text-primary-700">— Priya, E‑shop Manager</footer>
          </blockquote>
          
          <blockquote className="p-6 bg-primary-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-primary-500">
            <div className="text-primary-500 text-3xl mb-4">"</div>
            <p className="italic mb-6 text-gray-700">"Our conversion rate jumped 24% after we started using these AI-enhanced product images. Worth every penny!"</p>
            <footer className="font-medium text-primary-700">— Marco, Marketing Director</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

// Final CTA section
const FinalCTASection = () => {
  return (
    <section className="bg-primary-600 py-16 text-center text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Images?</h2>
        <p className="mb-6 text-lg max-w-xl mx-auto">Try it for free—no credit card required. Start enhancing your product photos today!</p>
        <a href="#demo" className="bg-secondary-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-secondary-600 transition-colors shadow-lg hover:shadow-xl">Get Started Now</a>
      </div>
    </section>
  );
};

// FAQ section
const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  const faqs = [
    {
      question: "Do I need professional equipment?",
      answer: "No—any clear photo from a smartphone works perfectly."
    },
    {
      question: "Can I use images commercially?",
      answer: "Yes—all generated images are yours to sell, advertise, and share."
    },
    {
      question: "Which products does it support?",
      answer: "Most physical products—fashion, electronics, decor, beauty, and more."
    },
    {
      question: "How much does it cost?",
      answer: "Plans start under $20/month. Start with a free trial—no card needed."
    }
  ];
  
  return (
    <section id="faq" className="py-16 bg-[#f8fafa]">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button 
                className={`w-full p-4 text-left font-medium flex justify-between items-center ${openFAQ === index ? 'text-primary-600' : 'text-gray-700'}`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg">{faq.question}</span>
                <span className="text-xl h-7 w-7 flex items-center justify-center rounded-full bg-gray-100">
                  {openFAQ === index ? '−' : '+'}
                </span>
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-4 text-gray-600 animate-accordion-down border-t border-gray-100">
                  <p className="pt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-dark text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="font-bold text-lg">ImageRefresh</div>
        <div className="space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-alt">Privacy</a>
          <a href="#" className="hover:text-alt">Terms</a>
          <a href="#" className="hover:text-alt">Contact</a>
        </div>
      </div>
    </footer>
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
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
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
    <section className="container mx-auto mb-8 py-8">
      <h2 className="text-3xl font-bold text-center text-primary mb-8">Choose Your Enhancement Styles</h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold mb-2 text-gray-800">Your Uploads</h3>
          <ul className="space-y-4">
            {images.map((image, index) => (
              <li 
                key={image.id} 
                className={`cursor-pointer p-2 rounded transition ${selectedImageIndex === index ? 'bg-alt/30 border-l-4 border-primary' : 'hover:bg-gray-100'}`}
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
                className="text-sm underline font-medium hover:text-primary transition"
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
                      className={`border rounded-lg overflow-hidden cursor-pointer transition ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => handleOptionClick(key)}
                    >
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{option.name}</h4>
                          <div className={`w-5 h-5 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'} flex items-center justify-center`}>
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
            className="mt-6 bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={totalOptionsSelected === 0 || isLoading}
            onClick={onSubmitSelections}
          >
            {isLoading ? "Processing..." : "Enhance My Images"}
          </button>
        </div>
      </div>
    </section>
  );
};

// Results component
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
      <h2 className="text-3xl font-bold mb-4 text-primary">Review & Select Your Favorites</h2>
      <div className="flex justify-end mb-4">
        <button 
          className="text-sm underline font-medium hover:text-primary transition"
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
              className="absolute top-2 left-2 w-5 h-5 accent-primary" 
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
              className="absolute top-2 left-2 w-5 h-5 accent-primary" 
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
        className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={selectedImages.size === 0}
        onClick={downloadSelected}
      >
        Download Selected Images ({selectedImages.size})
      </button>
    </section>
  );
};

// Processing section (while waiting for enhancement results)
const ProcessingSection = () => {
  return (
    <section className="container mx-auto text-center py-12">
      <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold mb-2 text-primary">Processing Your Images</h2>
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
  
  // Render landing page layout in all cases
  return (
    <div className="min-h-screen bg-[#f8fafa]">
      <AnnouncementBanner />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      
      {/* Dynamic content based on step */}
      {step === 'upload' && (
        <>
          <DemoSection 
            onImagesSelected={handleImagesSelected} 
            isUploading={uploadMutation.isPending}
          />
          <div className="container mx-auto p-4 mb-8">
            <IndustrySelector 
              onIndustryChange={handleIndustryChange}
              disabled={uploadMutation.isPending}
            />
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || !industry || uploadMutation.isPending}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}