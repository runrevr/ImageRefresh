import { useState, useEffect } from "react";
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

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [purpose, setPurpose] = useState("");
  const [industry, setIndustry] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [styleIntensity, setStyleIntensity] = useState([50]);
  const [addText, setAddText] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStylePrompt, setSelectedStylePrompt] = useState(""); // Track selected photography style prompt
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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

      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          variations: 2,
          purpose,
          industry,
          aspectRatio,
          styleIntensity: styleIntensity[0],
          addText,
          businessName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.imageUrls) {
        // Navigate to results page with the generated images
        window.location.href = `/text-to-image-results.html?${new URLSearchParams({
          imageUrls: encodeURIComponent(JSON.stringify(result.imageUrls)),
          prompt: finalPrompt, // Use the final enhanced prompt
          metadata: encodeURIComponent(JSON.stringify({
            variations: 2,
            purpose,
            industry,
            aspectRatio,
            styleIntensity: styleIntensity[0],
            addText,
            businessName,
          }))
        }).toString()}`;
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
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Be specific! Include: WHO (subjects) + WHAT (action) + WHERE (setting) + MOOD. Example: 'Two business partners shaking hands in a bright modern office, celebrating a successful deal, confident expressions'"
                className="w-full p-6 text-sm border-4 border-double border-gray-300 rounded-2xl focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 shadow-lg min-h-[120px] resize-none"
                onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && generateImages()}
              />
              <div className="absolute -bottom-6 left-0 right-0 h-8 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] via-[#40e0d0] via-[#00ff00] to-[#ff0080] opacity-60 blur-xl rounded-full animate-pulse" />
            </div>

            {/* Style Pills */}
            <div className="mt-12 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Add Photography Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { 
                    name: "Golden Hour", 
                    prompt: "captured during golden hour with warm amber sunlight streaming through, creating soft shadows and a dreamy atmosphere, gentle lens flare, honeyed tones throughout the scene, natural outdoor setting with diffused backlighting" 
                  },
                  { 
                    name: "Studio Lighting", 
                    prompt: "professional studio setting with multiple soft box lights creating even, flattering illumination, clean seamless backdrop, controlled shadows, commercial quality lighting setup, crisp details with balanced exposure" 
                  },
                  { 
                    name: "Black & White", 
                    prompt: "classic black and white photography with dramatic contrast between lights and darks, deep blacks and bright whites, no mid-tones, stark shadows creating bold visual impact, timeless monochrome aesthetic" 
                  },
                  { 
                    name: "Vintage Film", 
                    prompt: "shot on vintage 35mm film stock, warm orange and brown color grading, subtle film grain texture, slightly faded colors with nostalgic feel, soft focus edges, authentic analog photography aesthetic" 
                  },
                  { 
                    name: "Documentary", 
                    prompt: "documentary style candid moment captured naturally, unposed and authentic, environmental context visible, photojournalistic approach, available light only, raw and genuine emotion, slice-of-life composition" 
                  },
                  { 
                    name: "8K Ultra HD", 
                    prompt: "ultra high resolution 8K photography, extreme sharpness throughout, every texture and detail crystal clear, professional camera with premium lens, perfect focus from foreground to background, photorealistic quality" 
                  },
                  { 
                    name: "Motion Blur", 
                    prompt: "dynamic motion captured with intentional blur, vibrant saturated colors popping against the movement, shutter drag technique, energetic and kinetic feeling, streaks of color suggesting speed and action" 
                  },
                  { 
                    name: "Street Style", 
                    prompt: "urban street photography aesthetic, gritty city environment, mixed lighting from neon signs and streetlights, busy atmosphere with environmental context, raw authentic moment, handheld camera feel with slight tilt" 
                  }
                ].map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => {
                      // Toggle selection - if already selected, deselect it
                      if (selectedStylePrompt === style.prompt) {
                        setSelectedStylePrompt("");
                      } else {
                        setSelectedStylePrompt(style.prompt);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 min-h-[60px] flex items-center justify-center text-center text-sm font-medium ${
                      selectedStylePrompt === style.prompt
                        ? "border-[#06B6D4] bg-[#06B6D4] text-white"
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
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-300 rounded-lg hover:border-[#06B6D4] hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="square" id="square" />
                  <div>
                    <Label htmlFor="square" className="font-medium text-gray-900">Square (1:1)</Label>
                    <p className="text-sm text-gray-600">Instagram posts</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-300 rounded-lg hover:border-[#06B6D4] hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="wide" id="wide" />
                  <div>
                    <Label htmlFor="wide" className="font-medium text-gray-900">Wide (16:9)</Label>
                    <p className="text-sm text-gray-600">Website headers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 border-gray-300 rounded-lg hover:border-[#06B6D4] hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <div>
                    <Label htmlFor="portrait" className="font-medium text-gray-900">Portrait (9:16)</Label>
                    <p className="text-sm text-gray-600">Stories/Reels</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={generateImages}
            disabled={isGenerating}
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-[#06B6D4] to-[#84CC16] hover:from-[#0891B2] hover:to-[#65A30D] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Magic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Let's Make Some Magic
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </Layout>
  );
}