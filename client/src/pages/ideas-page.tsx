import { useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Import icons
import {
  ImageIcon,
  Paintbrush,
  Clock,
  BoxIcon,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

// Import data utilities
import { getCategories, getStylesByCategory, Category, Style } from "../../../shared/data.utils";

// Component for displaying a category card
const CategoryCard = ({ 
  category, 
  onClick 
}: { 
  category: Category; 
  onClick: (categoryId: string) => void;
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    ImageIcon: <ImageIcon className="h-12 w-12 mb-2 text-[#2A7B9B]" />,
    Paintbrush: <Paintbrush className="h-12 w-12 mb-2 text-[#2A7B9B]" />,
    Clock: <Clock className="h-12 w-12 mb-2 text-[#2A7B9B]" />,
    BoxIcon: <BoxIcon className="h-12 w-12 mb-2 text-[#2A7B9B]" />,
    Sparkles: <Sparkles className="h-12 w-12 mb-2 text-[#2A7B9B]" />,
  };

  // Count styles in this category
  const styleCount = category.styles.length;
  
  // Get the icon component or default to ImageIcon
  const IconComponent = category.icon && iconMap[category.icon] 
    ? iconMap[category.icon]
    : <ImageIcon className="h-12 w-12 mb-2 text-[#2A7B9B]" />;

  return (
    <Card 
      className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-[#2A7B9B] cursor-pointer"
      onClick={() => onClick(category.id)}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
        {IconComponent}
        <h3 className="text-lg font-bold mb-2">{category.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{category.description}</p>
        <div className="text-xs bg-[#2A7B9B]/10 text-[#2A7B9B] font-medium px-2 py-1 rounded-full">
          {styleCount} style{styleCount !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for displaying a style card
const StyleCard = ({ 
  style, 
  onSelect 
}: { 
  style: Style; 
  onSelect: (style: Style) => void;
}) => {
  // Add console log to debug the style properties
  console.log(`Style Card: id=${style.id}, name=${style.name}, image path:`, 
    style.id === "old-western" ? "/western.jpg" : (style.id === "lego" ? "/lego-character.png" : style.previewImage)
  );
  
  // For old-western and lego, use hard-coded image paths
  const imageSrc = (() => {
    if (style.id === "old-western") return "/western.jpg"; // Using jpg version
    if (style.id === "lego") return "/lego-character.png";
    return style.previewImage;
  })();
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-[#2A7B9B] h-full"
    >
      <div className="relative w-full h-48 overflow-hidden">
        <img 
          src={imageSrc}
          alt={style.name}
          className="w-full h-full object-cover"
        />
        
        {/* Tags */}
        <div className="absolute top-2 right-2 flex gap-1">
          {style.featured && (
            <span className="bg-[#FF7B54] text-white px-2 py-1 rounded text-xs font-medium">
              Featured
            </span>
          )}
          {style.new && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              New
            </span>
          )}
          {style.popular && (
            <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
              Popular
            </span>
          )}
        </div>
      </div>

      <CardHeader className="p-3 pb-1 bg-[#FF7B54] rounded-t-lg">
        <CardTitle className="text-lg font-bold text-center mb-2 text-white">
          {style.name}
        </CardTitle>
        <CardDescription className="text-xs text-white text-opacity-90">{style.description}</CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-center p-3">
        <Link href="/?showUpload=true">
          <Button 
            className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white w-full"
            onClick={() => onSelect(style)}
          >
            Use This Style
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default function IdeasPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get all categories from our data structure
  const categories = getCategories();
  
  // Get styles for the selected category
  const styles = selectedCategory 
    ? getStylesByCategory(selectedCategory)
    : [];

  // Function to save the selected style to localStorage
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

  // Function to go back to categories
  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  // Selected category object
  const currentCategory = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : null;

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-[#2A7B9B]">
            {selectedCategory ? currentCategory?.name || 'Transformation Styles' : 'Transformation Ideas'}
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            {selectedCategory 
              ? `Choose from our ${styles.length} ${currentCategory?.name.toLowerCase()} styles to transform your images.`
              : 'Explore different categories and styles to inspire your next image transformation.'}
          </p>
        </div>

        {/* Breadcrumb navigation when a category is selected */}
        {selectedCategory && (
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center text-[#2A7B9B] hover:text-[#2A7B9B]/80 pl-0"
              onClick={handleBackToCategories}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Button>
          </div>
        )}

        {/* Category Grid (3x3) */}
        {!selectedCategory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={setSelectedCategory}
              />
            ))}
          </div>
        )}

        {/* Styles Section Heading */}
        {selectedCategory && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3 text-[#FF7B54]">
                Popular {currentCategory?.name} Styles
              </h2>
              <p className="text-gray-600">
                Select any style below to transform your images with this look.
              </p>
            </div>
            
            {/* Styles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {styles.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  onSelect={saveStylePrompt}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Empty state if no styles are found */}
        {selectedCategory && styles.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No styles found</h3>
            <p className="text-gray-500 mb-6">There are no styles available in this category yet.</p>
            <Button 
              variant="outline" 
              className="mx-auto"
              onClick={handleBackToCategories}
            >
              Back to Categories
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}