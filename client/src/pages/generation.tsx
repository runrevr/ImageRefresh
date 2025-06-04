import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import PromptInput from "@/components/PromptInput";
import { useToast } from "@/hooks/use-toast";

export default function Generation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleGenerate = async (prompt: string, imageSize?: string, selectedStyle?: string) => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize: imageSize || "square"
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        // Navigate to results with the generated images
        navigate('/text-to-image-results', {
          state: {
            imageUrls: data.imageUrls,
            prompt: prompt,
            metadata: {
              variations: data.imageUrls.length,
              selectedStyle,
              imageSize: imageSize || "square"
            }
          }
        });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Create Any Image You Can Imagine
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Describe what you want and let AI bring your vision to life
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <PromptInput
              originalImage="" 
              onSubmit={() => {}}
              onBack={() => {}}
              onGenerate={handleGenerate}
              isGenerationMode={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}