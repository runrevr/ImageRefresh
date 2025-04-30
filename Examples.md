# Examples of Using the Centralized Data Structure

## 1. Importing the data utilities

```typescript
// Import the utility functions
import { 
  getCategories, 
  getStylesByCategory, 
  getFeaturedStyles, 
  getStyle 
} from '@shared/data.utils';
```

## 2. Using in the Ideas Page

```tsx
import { useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { getFeaturedStyles, Style } from "@shared/data.utils";

export default function IdeasPage() {
  const { toast } = useToast();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Get featured styles for the ideas page
  const featuredStyles = getFeaturedStyles();

  const saveStylePrompt = (style: Style) => {
    // Save the selected style in localStorage for use on the home page
    localStorage.setItem('selectedStyle', JSON.stringify({
      prompt: style.prompt,
      title: style.name,
      category: style.category
    }));
    
    toast({
      title: "Style selected!",
      description: `The "${style.name}" style will be applied to your next image.`,
    });
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#2A7B9B] to-[#A3E4D7] inline-block text-transparent bg-clip-text">
            Transformation Ideas
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            Explore different styles and prompts to inspire your next image transformation. 
            Hover over cards to see before/after examples.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-12">
          {featuredStyles.map((style) => (
            <div key={style.id} className="w-full sm:w-[45%] md:w-[30%]" style={{ minWidth: "250px", maxWidth: "400px" }}>
              <Card 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-[#2A7B9B] h-full"
                onMouseEnter={() => setHoveredCard(style.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img 
                    src={hoveredCard === style.id ? style.previewImage : style.beforeImage} 
                    alt={hoveredCard === style.id ? "Transformed image" : "Original image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium bg-black bg-opacity-60 px-3 py-1 rounded">
                      {hoveredCard === style.id ? "After" : "Before"}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 bg-white bg-opacity-50 text-black px-2 py-1 rounded text-xs font-medium">
                    {style.category}
                  </div>
                </div>

                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-base font-bold text-[#333333]">{style.name}</CardTitle>
                  <CardDescription className="text-xs">{style.description}</CardDescription>
                </CardHeader>

                <CardFooter className="flex justify-center p-3">
                  <Link href="/?showUpload=true">
                    <Button 
                      className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white w-full"
                      onClick={() => saveStylePrompt(style)}
                    >
                      Use This Style
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
```

## 3. Using in the Prompt Input Component

```tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  getCategories, 
  getStylesByCategory, 
  getStyle,
  Category,
  Style
} from "@shared/data.utils";

interface PromptInputProps {
  originalImage: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onBack: () => void;
  selectedTransformation?: string | null;
  defaultPrompt?: string;
  savedStyle?: {
    prompt: string;
    title: string;
    category: string;
  } | null;
}

export default function PromptInput({
  originalImage,
  onSubmit,
  onBack,
  selectedTransformation,
  defaultPrompt,
  savedStyle
}: PromptInputProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>(defaultPrompt || "");
  const [imageSize, setImageSize] = useState<string>("1024x1024");

  // Get all categories
  const categories = getCategories();
  
  // Get styles for the selected category
  const categoryStyles = selectedCategory 
    ? getStylesByCategory(selectedCategory) 
    : [];

  // Load saved style if provided
  useEffect(() => {
    if (savedStyle) {
      setPromptText(savedStyle.prompt);
    }
  }, [savedStyle]);
  
  // Handle style selection
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    
    // Get the selected style and its prompt
    const style = getStyle(styleId);
    if (style) {
      setPromptText(style.prompt);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    onSubmit(promptText, imageSize);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Create Your Transformation</h2>
      
      {/* Category Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Select a Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {/* Render the icon dynamically - would need to implement */}
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Style Selection (if category is selected) */}
      {selectedCategory && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Select a Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryStyles.map((style) => (
              <div
                key={style.id}
                className={`cursor-pointer border rounded-lg p-2 hover:border-primary ${
                  selectedStyle === style.id ? "border-primary bg-primary/10" : ""
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                <img 
                  src={style.previewImage} 
                  alt={style.name} 
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <p className="text-sm font-medium">{style.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Prompt Textarea */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">
          Customize Prompt (Optional)
        </h3>
        <Textarea
          placeholder="Describe additional details or modifications to the selected style..."
          className="min-h-[120px]"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Generate Transformation
        </Button>
      </div>
    </div>
  );
}
```

## 4. Using in a Server Route

```typescript
import { getStyle } from "@shared/data.utils";

// Example API endpoint that uses a style prompt
app.post("/api/transform-with-style", async (req, res) => {
  try {
    const { styleId, originalImagePath, customPrompt } = req.body;
    
    // Get the base style
    const style = getStyle(styleId);
    if (!style) {
      return res.status(400).json({ message: "Style not found" });
    }
    
    // Combine base prompt with custom additions
    const finalPrompt = customPrompt 
      ? `${style.prompt} ${customPrompt}`
      : style.prompt;
    
    // Rest of the transformation code...
    
    res.json({
      // Response data...
    });
  } catch (error) {
    console.error("Error in transform-with-style:", error);
    res.status(500).json({ message: "Error processing transformation" });
  }
});
```