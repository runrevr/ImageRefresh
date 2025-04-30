import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Import icons
import {
  ImageIcon,
  Paintbrush,
  Clock,
  BoxIcon,
  Sparkles,
  Check
} from "lucide-react";

// Import data utilities
import { 
  getCategories, 
  getStylesByCategory, 
  getStyle
} from "../../../shared/data.utils";
import type { Category, Style } from "../../../shared/data.types";

// Props for the component
interface CompactStyleSelectorProps {
  onSelectStyle: (style: Style) => void;
  selectedStyleId?: string;
  showThumbnails?: boolean;
  maxHeight?: string;
  initialCategory?: string;
}

// Compact style selector component
export default function CompactStyleSelector({
  onSelectStyle,
  selectedStyleId,
  showThumbnails = true,
  maxHeight = "400px",
  initialCategory
}: CompactStyleSelectorProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "");
  const [showMobileSelect, setShowMobileSelect] = useState(window.innerWidth < 640);
  
  // Get categories
  const categories = getCategories();
  
  // Get styles for the selected category
  const styles = selectedCategory
    ? getStylesByCategory(selectedCategory)
    : [];

  // Icon mapping for categories
  const iconMap: Record<string, React.ReactNode> = {
    ImageIcon: <ImageIcon className="h-4 w-4" />,
    Paintbrush: <Paintbrush className="h-4 w-4" />,
    Clock: <Clock className="h-4 w-4" />,
    BoxIcon: <BoxIcon className="h-4 w-4" />,
    Sparkles: <Sparkles className="h-4 w-4" />,
  };

  // Handle style selection
  const handleStyleSelect = (style: Style) => {
    onSelectStyle(style);
    
    toast({
      title: "Style selected",
      description: `You've selected the "${style.name}" style.`,
      duration: 3000,
    });
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="w-full">
      <Card className="border rounded-lg overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg font-bold">Select a Style</CardTitle>
          <CardDescription>Choose a transformation style for your image</CardDescription>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Mobile Dropdown for Categories */}
          <div className="block sm:hidden mb-4">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      {category.icon && iconMap[category.icon]}
                      <span className="ml-2">{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Desktop Tabs for Categories */}
          <div className="hidden sm:block mb-4">
            <Tabs 
              defaultValue={selectedCategory || categories[0]?.id} 
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <TabsList className="w-full grid" style={{ 
                gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` 
              }}>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-1">
                    {category.icon && iconMap[category.icon]}
                    <span className="hidden md:inline ml-1">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Styles List */}
          {selectedCategory ? (
            <ScrollArea className="pr-3" style={{ maxHeight }}>
              <div className="space-y-2">
                {styles.map((style) => (
                  <div 
                    key={style.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100 ${
                      selectedStyleId === style.id ? 'bg-gray-100 border border-[#2A7B9B]/30' : 'border border-gray-200'
                    }`}
                    onClick={() => handleStyleSelect(style)}
                  >
                    {/* Style Thumbnail */}
                    {showThumbnails && (
                      <div className="w-12 h-12 mr-3 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                        <img 
                          src={style.previewImage} 
                          alt={style.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Style Info */}
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{style.name}</h4>
                        {selectedStyleId === style.id && (
                          <Check className="h-4 w-4 text-[#2A7B9B]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{style.description}</p>
                      
                      {/* Badges */}
                      <div className="flex mt-1 space-x-1">
                        {style.featured && (
                          <span className="px-1.5 py-0.5 bg-[#FF7B54]/10 text-[#FF7B54] rounded text-[10px]">
                            Featured
                          </span>
                        )}
                        {style.new && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">
                            New
                          </span>
                        )}
                        {style.popular && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Empty state */}
              {styles.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-gray-500 text-sm">No styles available in this category</p>
                </div>
              )}
            </ScrollArea>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">Select a category to view available styles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}