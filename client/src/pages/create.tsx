
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResultView from "@/components/ResultView";

export default function Create() {
  const [prompt, setPrompt] = useState("");
  const [purpose, setPurpose] = useState("");
  const [industry, setIndustry] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [styleIntensity, setStyleIntensity] = useState([50]);
  const [addText, setAddText] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStylePrompt, setSelectedStylePrompt] = useState(""); // Track selected photography style prompt
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImageAndGetPath = async (base64Image: string): Promise<string> => {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    
    // Upload and get path
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }
    
    const { imagePath } = await uploadResponse.json();
    console.log('Received file path from upload:', imagePath);
    return imagePath;
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setUploadedImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Combine user prompt with selected photography style
    const finalPrompt = selectedStylePrompt 
      ? `${prompt.trim()}, ${selectedStylePrompt}`
      : prompt.trim();

    const settings = {
      prompt: finalPrompt,
      purpose,
      industry,
      aspectRatio,
      styleIntensity: styleIntensity[0],
      addText,
      businessName: addText ? businessName : undefined,
    };

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspectRatio
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        const params = new URLSearchParams({
          jobId: data.transformationId || data.jobId || `txt2img_${Date.now()}`,
          imageUrls: encodeURIComponent(JSON.stringify(data.imageUrls)),
          prompt: encodeURIComponent(prompt),
          purpose: encodeURIComponent(purpose),
          industry: encodeURIComponent(industry),
          aspectRatio: encodeURIComponent(aspectRatio),
          styleIntensity: encodeURIComponent(styleIntensity[0]),
          addText: addText.toString(),
          businessName: encodeURIComponent(businessName)
        });

        window.location.href = `/text-to-image-results.html?${params.toString()}`;
      } else {
        toast({
          title: "Generation failed",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // First enhance the prompt if it's not already enhanced
      let finalPrompt = prompt;

      // Check if we should enhance the prompt (only if it's relatively short and basic)
      if (prompt.length < 100 && !prompt.includes("detailed") && !prompt.includes("photorealistic")) {
        try {
          const enhanceResponse = await fetch("/api/enhance-prompt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          });

          if (enhanceResponse.ok) {
            const enhanceResult = await enhanceResponse.json();
            if (enhanceResult.enhancedPrompt) {
              finalPrompt = enhanceResult.enhancedPrompt;
              console.log("Enhanced prompt:", finalPrompt);
            }
          }
        } catch (enhanceError) {
          console.warn("Failed to enhance prompt, using original:", enhanceError);
        }
      }

      // Add style prompt if selected
      if (selectedStylePrompt) {
        finalPrompt = `${finalPrompt}. ${selectedStylePrompt}`;
      }

      let response;

      if (uploadedImage) {
        try {
          // Upload image and get path
          const imagePath = await uploadImageAndGetPath(uploadedImage);
          
          // Now call edit-image with just the path
          response = await fetch('/api/edit-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalImagePath: imagePath,  // Just the path, like Transform does
              prompt: finalPrompt,
              aspectRatio
            })
          });
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
      } else {
        // Text-to-image generation
        response = await fetch("/api/generate-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            variations: 2,
            numImages: 2,
            purpose,
            industry,
            aspectRatio,
            styleIntensity: styleIntensity[0],
            addText,
            businessName,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.imageUrls) {
        // Set the result images to display inline
        setResultImages(result.imageUrls);
        
        // Auto-scroll to results after a brief delay
        setTimeout(() => {
          const resultsElement = document.getElementById('results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        throw new Error(result.error || "Failed to generate images");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Create Any Scene You Can Imagine
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Describe what you need and let AI bring your vision to life
          </p>

          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="relative border-4 border-double border-gray-700 rounded-2xl focus-within:border-[#06B6D4] shadow-lg overflow-hidden bg-gray-800">
              <div className="flex items-center">
                {/* Image Upload Button/Preview */}
                <div className="flex-shrink-0 border-r-2 border-gray-700">
                  {uploadedImage ? (
                    <div className="relative w-[40px] h-[40px]">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-0 right-0 bg-white/80 backdrop-blur rounded p-0.5 shadow hover:bg-white text-xs"
                        title="Change image"
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-0 left-0 bg-white/80 backdrop-blur rounded p-0.5 shadow hover:bg-white text-xs"
                        title="Remove image"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-[40px] h-[40px] hover:bg-gray-700 transition-all flex items-center justify-center group"
                      type="button"
                      title="Upload image"
                    >
                      <span className="text-lg text-gray-400 group-hover:text-[#06B6D4] transition-colors">+</span>
                    </button>
                  )}
                </div>

                {/* Textarea */}
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={uploadedImage 
                    ? "Describe how you want to transform this image..." 
                    : "Describe your idea! Example: 'A friendly dragon teaching a young princess how to paint rainbows in a magical forest, bright cheerful colors, whimsical storybook style'"
                  }
                  className="flex-1 py-2 px-4 text-base border-0 focus:outline-none focus:ring-0 h-[40px] focus:h-[80px] transition-all duration-200 resize-none overflow-hidden bg-transparent text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && generateImages()}
                />
              </div>
            </div>
            <div className="absolute -bottom-6 left-0 right-0 h-8 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] via-[#40e0d0] via-[#00ff00] to-[#ff0080] opacity-60 blur-xl rounded-full animate-pulse" />
          </div>

            {/* Style Pills */}
            <div className="mt-12 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Add Creative Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { 
                    name: "Golden Hour", 
                    prompt: "captured during golden hour with warm amber sunlight streaming through, creating soft shadows and a dreamy atmosphere, gentle lens flare, honeyed tones throughout the scene, natural outdoor setting with diffused backlighting" 
                  },
                  { 
                    name: "Double Exposure", 
                    prompt: "double exposure effect, silhouette blended with secondary imagery, transparent overlay, dreamy fade between images, artistic photographic blend, ethereal combination of two visual elements" 
                  },
                  { 
                    name: "8K Ultra HD", 
                    prompt: "ultra high resolution 8K photography, extreme sharpness throughout, every texture and detail crystal clear, professional camera with premium lens, perfect focus from foreground to background, photorealistic quality" 
                  },
                  { 
                    name: "Black & White", 
                    prompt: "classic black and white photography with dramatic contrast between lights and darks, deep blacks and bright whites, strong tonal range, timeless monochrome aesthetic, emphasis on form and texture over color" 
                  },
                  { 
                    name: "Documentary", 
                    prompt: "documentary style candid moment captured naturally, unposed and authentic, environmental context visible, photojournalistic approach, available light only, raw and genuine emotion, slice-of-life composition" 
                  },
                  { 
                    name: "Vintage Polaroid", 
                    prompt: "vintage polaroid photograph, faded white borders, light leaks, nostalgic color shift with slightly washed out colors, slightly overexposed, authentic instant film grain, 1970s instant photo aesthetic, square format" 
                  },
                  { 
                    name: "80's Airbrush", 
                    prompt: "80s airbrush art style, neon pink and electric blue gradients, chrome metallic effects, retro-futuristic aesthetic, glossy finish, laser grid background, Miami Vice color palette, smooth blended colors" 
                  },
                  { 
                    name: "3D Low Poly", 
                    prompt: "low-poly 3D art style, geometric faceted surfaces, flat shaded polygons, minimalist color palette, early PlayStation graphics aesthetic, angular crystalline structure, simplified geometric forms" 
                  },
                  { 
                    name: "3D Animation", 
                    prompt: "modern 3D animation style like Pixar or DreamWorks, smooth rendered surfaces, vibrant colors, expressive character design, professional CGI quality, detailed textures and lighting, cinematic presentation" 
                  },
                  { 
                    name: "Comic Book", 
                    prompt: "comic book style illustration, bold black outlines, Ben Day dot shading, vibrant primary colors, speech bubble effects, dynamic action lines, dramatic angles, superhero comic aesthetic" 
                  }
                ].map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Toggle selection - if already selected, deselect it
                      if (selectedStylePrompt === style.prompt) {
                        setSelectedStylePrompt("");
                      } else {
                        setSelectedStylePrompt(style.prompt);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 min-h-[60px] flex items-center justify-center text-center text-sm font-medium cursor-pointer ${
                      selectedStylePrompt === style.prompt
                        ? "border-[#06B6D4] bg-[#06B6D4] text-white shadow-md"
                        : "border-gray-200 hover:border-[#06B6D4] bg-white hover:bg-gray-50 text-gray-700 hover:text-[#06B6D4]"
                    }`}
                    title={style.prompt}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Image Size</h2>
          </div>
          <div>
            <Label className="text-base font-semibold mb-4 block text-gray-800">Aspect Ratio</Label>
            <RadioGroup value={aspectRatio} onValueChange={setAspectRatio}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label htmlFor="square" className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                  aspectRatio === "square" ? "border-[#06B6D4] bg-[#06B6D4]/10" : "border-gray-300 hover:border-[#06B6D4] hover:bg-gray-50"
                }`}>
                  <RadioGroupItem value="square" id="square" />
                  <div>
                    <div className="font-medium text-gray-900">Square (1:1)</div>
                    <p className="text-sm text-gray-600">Instagram posts</p>
                  </div>
                </label>
                <label htmlFor="wide" className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                  aspectRatio === "wide" ? "border-[#06B6D4] bg-[#06B6D4]/10" : "border-gray-300 hover:border-[#06B6D4] hover:bg-gray-50"
                }`}>
                  <RadioGroupItem value="wide" id="wide" />
                  <div>
                    <div className="font-medium text-gray-900">Landscape (16:9)</div>
                    <p className="text-sm text-gray-600">Website headers</p>
                  </div>
                </label>
                <label htmlFor="portrait" className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                  aspectRatio === "portrait" ? "border-[#06B6D4] bg-[#06B6D4]/10" : "border-gray-300 hover:border-[#06B6D4] hover:bg-gray-50"
                }`}>
                  <RadioGroupItem value="portrait" id="portrait" />
                  <div>
                    <div className="font-medium text-gray-900">Portrait (2:3)</div>
                    <p className="text-sm text-gray-600">Stories/Reels</p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={generateImages}
            disabled={isGenerating || !prompt.trim()}
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-[#06B6D4] to-[#84CC16] hover:from-[#0891B2] hover:to-[#65A30D] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Magic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {prompt.trim() ? "Let's Make Some Magic" : "Enter a prompt to begin"}
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {resultImages.length > 0 && (
          <div id="results-section" className="mt-8">
            <ResultView
              originalImage={uploadedImage || ""}
              transformedImage={resultImages[0]}
              secondTransformedImage={resultImages[1] || null}
              onTryAgain={() => {
                setResultImages([]);
                setPrompt("");
                setUploadedImage(null);
              }}
              onNewImage={() => {
                setResultImages([]);
                setPrompt("");
                setUploadedImage(null);
              }}
              freeCredits={0}
              paidCredits={0}
              prompt={prompt}
              canEdit={false}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
