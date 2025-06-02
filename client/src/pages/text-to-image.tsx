import { useState } from "react";
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
  const { toast } = useToast();

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

    const settings = {
      prompt: prompt.trim(),
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
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        const params = new URLSearchParams({
          jobId: data.jobId,
          imageUrl: encodeURIComponent(data.imageUrl),
          prompt: encodeURIComponent(data.metadata.prompt),
          ...(data.metadata.purpose && { purpose: encodeURIComponent(data.metadata.purpose) }),
          ...(data.metadata.industry && { industry: encodeURIComponent(data.metadata.industry) }),
          ...(data.metadata.aspectRatio && { aspectRatio: encodeURIComponent(data.metadata.aspectRatio) }),
          ...(data.metadata.styleIntensity && { styleIntensity: data.metadata.styleIntensity }),
          ...(data.metadata.addText !== undefined && { addText: data.metadata.addText }),
          ...(data.metadata.businessName && { businessName: encodeURIComponent(data.metadata.businessName) })
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
                placeholder="Try: 'relaxing massage therapy session' or 'professional plumber fixing pipes' or 'beautiful lawn care results'"
                className="w-full p-6 text-sm border-4 border-double border-gray-300 rounded-2xl focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 shadow-lg min-h-[120px] resize-none"
                onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && enhancePrompt()}
              />
              <div className="absolute -bottom-6 left-0 right-0 h-8 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] via-[#40e0d0] via-[#00ff00] to-[#ff0080] opacity-60 blur-xl rounded-full animate-pulse" />
            </div>
            
            </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="purpose" className="text-base font-semibold mb-3 block">
                  What's this for?
                </Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Website header, social media post, etc."
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="industry" className="text-base font-semibold mb-3 block">
                  Industry/Business Type
                </Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Restaurant, fitness, tech, etc."
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">Aspect Ratio</Label>
              <RadioGroup value={aspectRatio} onValueChange={setAspectRatio}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="square" id="square" />
                    <div>
                      <Label htmlFor="square" className="font-medium">Square (1:1)</Label>
                      <p className="text-sm text-gray-500">Instagram posts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="wide" id="wide" />
                    <div>
                      <Label htmlFor="wide" className="font-medium">Wide (16:9)</Label>
                      <p className="text-sm text-gray-500">Website headers</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="portrait" id="portrait" />
                    <div>
                      <Label htmlFor="portrait" className="font-medium">Portrait (9:16)</Label>
                      <p className="text-sm text-gray-500">Stories/Reels</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">Style Intensity</Label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Natural</span>
                <Slider
                  value={styleIntensity}
                  onValueChange={setStyleIntensity}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">Stylized</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Current: {styleIntensity[0]}%</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addText"
                  checked={addText}
                  onCheckedChange={(checked) => setAddText(checked === true)}
                />
                <Label htmlFor="addText" className="text-base font-semibold">
                  Add business name to image
                </Label>
              </div>

              {addText && (
                <div>
                  <Label htmlFor="businessName" className="text-base font-semibold mb-3 block">
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                    className="max-w-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button
            onClick={enhancePrompt}
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