import { useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowRight,
} from "lucide-react";

// Import specific images
import westernImage from "../assets/Western.png";
import legoCharacterImage from "../assets/lego-character.png";
import hiphopImage from "../assets/Hiphop.png";
import eightyImage from "../assets/80s.png";
import renaissanceImage from "../assets/Renaissance.png";
import victorianImage from "../assets/Victorian era.png";
import medievalImage from "../assets/medieval.png";
import sunsetShampooImage from "../assets/sunset-shampoo.jpg";
import trumpMulletImage from "../assets/trump-mullet.png";
import trumpMulletNewImage from "../assets/trump-mullet-new.png";
import babyImage from "../assets/tk-ts-baby.jpg";
import agingImage from "../assets/aging.png";
import twentyYearsImage from "../assets/20years.png";
import ghibliImage from "../assets/ghibli.png";
import theKingImage from "../assets/the-king.png";
import petToHumanImage from "../assets/pet-to-human.png";
import beerDrinkingDeerImage from "../assets/beer-drinking-deer.png";
import prisonCatImage from "../assets/prison-cat.png";

// Import category background images
import kidsBackgroundImage from "../assets/lego-character.png"; // Using Lego image for Kids category
import artisticBackgroundImage from "../assets/Renaissance.png"; // Using Renaissance image for Artistic category
import historicalBackgroundImage from "../assets/80s.png"; // Using 80s image for Historical category
import productBackgroundImage from "../assets/sunset-shampoo.jpg"; // Using sunset shampoo image for Product category
import funViralBackgroundImage from "../assets/trump-mullet-new.png"; // Using new Trump Mullet image for Fun/Viral category

// Import data utilities
import {
  getCategories,
  getStylesByCategory,
  Category,
  Style,
} from "../../../shared/data.utils";

// Component for displaying a category card
const CategoryCard = ({
  category,
  onClick,
}: {
  category: Category;
  onClick: (categoryId: string) => void;
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    ImageIcon: <ImageIcon className="h-12 w-12 mb-2 text-white" />,
    Paintbrush: <Paintbrush className="h-12 w-12 mb-2 text-white" />,
    Clock: <Clock className="h-12 w-12 mb-2 text-white" />,
    BoxIcon: <BoxIcon className="h-12 w-12 mb-2 text-white" />,
    Sparkles: <Sparkles className="h-12 w-12 mb-2 text-white" />,
  };

  // Count styles in this category
  const styleCount = category.styles.length;

  // Get the icon component or default to an appropriate icon based on category id
  let IconComponent;

  if (category.icon && iconMap[category.icon]) {
    IconComponent = iconMap[category.icon];
  } else {
    // Default icons based on category id
    switch (category.id) {
      case "animation":
        IconComponent = <Sparkles className="h-12 w-12 mb-2 text-white" />;
        break;
      case "historical":
        IconComponent = <Clock className="h-12 w-12 mb-2 text-white" />;
        break;
      case "product":
        IconComponent = <BoxIcon className="h-12 w-12 mb-2 text-white" />;
        break;
      case "artistic":
        IconComponent = <Paintbrush className="h-12 w-12 mb-2 text-white" />;
        break;
      default:
        IconComponent = <ImageIcon className="h-12 w-12 mb-2 text-white" />;
    }
  }

  // Map category ID to background image
  let backgroundImage;
  switch (category.id) {
    case "animation":
      backgroundImage = kidsBackgroundImage;
      break;
    case "artistic":
      backgroundImage = artisticBackgroundImage;
      break;
    case "historical":
      backgroundImage = historicalBackgroundImage;
      break;
    case "product":
      backgroundImage = productBackgroundImage;
      break;
    default:
      backgroundImage = kidsBackgroundImage; // Default fallback
  }

  return (
    <Card className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-[#2A7B9B] hover:scale-[1.03] cursor-pointer">
      <div className="relative">
        {/* Background image with overlay */}
        <div className="h-64 overflow-hidden">
          <img
            src={backgroundImage}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 flex flex-col items-center justify-center px-4 py-8 text-center">
            {IconComponent}
            <h3 className="text-xl font-bold mb-2 text-white">
              {category.id === "historical"
                ? "Pop Culture Thru The Years"
                : category.name}
            </h3>

            {/* Styles count above description */}
            <div className="text-xs bg-white/20 text-white font-medium px-3 py-1 rounded-full mb-2">
              {styleCount} style{styleCount !== 1 ? "s" : ""}
            </div>

            <p className="text-sm text-white/90 mb-4">{category.description}</p>

            {/* Explore Styles button with animated arrow */}
            <Button
              className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white mt-1 group"
              onClick={() => onClick(category.id)}
            >
              <span className="flex items-center">
                Explore Styles
                <ArrowRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Component for displaying a style card
const StyleCard = ({
  style,
  onSelect,
}: {
  style: Style;
  onSelect: (style: Style) => void;
}) => {
  // Handle imported images for specific styles
  let imageSrc = style.previewImage;

  // Use imported images for specific styles
  if (style.id === "old-western") {
    imageSrc = westernImage;
  } else if (style.id === "lego") {
    imageSrc = legoCharacterImage;
  } else if (style.id === "90s-hip-hop") {
    imageSrc = hiphopImage;
  } else if (style.id === "1980s") {
    imageSrc = eightyImage;
  } else if (style.id === "renaissance") {
    imageSrc = renaissanceImage;
  } else if (style.id === "victorian-era") {
    imageSrc = victorianImage;
  } else if (style.id === "medieval") {
    imageSrc = medievalImage;
  } else if (style.id === "baby-prediction") {
    imageSrc = babyImage;
  } else if (style.id === "future-self") {
    imageSrc = twentyYearsImage;
  } else if (style.id === "ghibli-style") {
    imageSrc = ghibliImage;
  } else if (style.id === "ai-action-figure") {
    imageSrc = theKingImage;
  } else if (style.id === "mullets") {
    imageSrc = trumpMulletNewImage;
  } else if (style.id === "pet-as-human") {
    imageSrc = petToHumanImage;
  } else if (style.id === "custom-other") {
    imageSrc = beerDrinkingDeerImage;
  } else if (style.id === "self-as-cat") {
    imageSrc = prisonCatImage;
  }

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-[#2A7B9B] hover:scale-[1.03] cursor-pointer h-full">
      <div className="relative w-full h-64 overflow-hidden">
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
        <CardDescription className="text-xs text-white text-opacity-90">
          {style.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-center p-3">
        <Link href="/?showUpload=true" className="w-full">
          <Button
            className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white w-full group"
            onClick={() => onSelect(style)}
          >
            <span className="flex items-center justify-center">
              Use This Style
              <ArrowRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
            </span>
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
  let styles = selectedCategory ? getStylesByCategory(selectedCategory) : [];

  // Special handling for "other" category (Fun/Viral)
  if (selectedCategory === "other") {
    // Fun/Viral styles - simplified with existing images to avoid errors
    styles = [
      {
        id: "mullets",
        name: "Mullets",
        description: "It's well known that everyone secretly wants to look like Joe Dirt.",
        category: "other",
        prompt: "Transform this person's hairstyle into an iconic mullet while preserving their natural hair color, facial features, and identity. Create a \"business in the front, party in the back\" hairstyle with short, styled hair on top and sides while adding longer, flowing hair extending down the neck and back. Vary the mullet style to include classic 80s volume, modern mullet interpretations, or extreme versions with dramatic length contrasts. For some variations, include distinctive side elements like sideburns, \"chops,\" or temple hair that connects to the mustache area. Add subtle rock-and-roll styling elements like slight dishevelment, styled volume, or a hint of rebellious attitude in the expression that suggests the person enjoys rock music. Ensure the mullet looks natural yet distinctive on the subject, adapting to their face shape while maintaining the exact same hair color as the original photo. The result should appear as if the person genuinely styled their hair this way for a rock concert or performance, preserving lighting and photographic qualities of the original image.",
        previewImage: trumpMulletNewImage, // Using the new Trump Mullet image
        beforeImage: "/assets/couple-field.png",
        popular: true,
        tags: ["hairstyle", "retro", "funny", "rock", "80s"],
      },
      {
        id: "baby-prediction",
        name: "What Will Our Baby Look Like",
        description:
          "Envision how a future baby might look based on the people in the image.",
        category: "other",
        prompt:
          "Create a realistic image of a baby that would result from the genetics of the two people in the uploaded photos.",
        previewImage: "/assets/couple-field-painting.png",
        beforeImage: "/assets/couple-field.png",
        popular: true,
        tags: ["family", "future", "prediction"],
      },
      {
        id: "future-self",
        name: "What Will I Look Like in 20 Years",
        description:
          "Age the subject in the image to show how they might look 20 years in the future.",
        category: "other",
        prompt: "Show how the person might look 20 years in the future.",
        previewImage: "/assets/couple-field-painting.png",
        beforeImage: "/assets/couple-field.png",
        popular: true,
        tags: ["aging", "future", "prediction"],
      },
      {
        id: "ghibli-style",
        name: "Ghibli Style",
        description:
          "Transform into the beautiful, painterly anime style of Studio Ghibli films.",
        category: "other",
        prompt: "Transform into the distinctive Studio Ghibli animation style.",
        previewImage: "/assets/couple-field-painting.png",
        beforeImage: "/assets/couple-field.png",
        featured: true,
        tags: ["anime", "watercolor", "magical"],
      },
      {
        id: "ai-action-figure",
        name: "AI Action Figure",
        description:
          "Turn the subject into a realistic, detailed action figure or toy.",
        category: "other",
        prompt:
          "Create a picture of an action figure toy in a blister package.",
        previewImage: "/assets/couple-field-painting.png",
        beforeImage: "/assets/couple-field.png",
        new: true,
        tags: ["toy", "product", "collectible"],
      },
      {
        id: "pet-as-human",
        name: "What Would My Pet Look Like as a Human",
        description:
          "Reimagine a pet as a human while keeping recognizable traits and personality.",
        category: "other",
        prompt: "Transform the pet into a human character.",
        previewImage: petToHumanImage, // Using the new Pet-to-Human image
        beforeImage: "/assets/couple-field.png",
        new: true,
        tags: ["pets", "transformation", "fun"],
      },
      {
        id: "self-as-cat",
        name: "What Would I Look Like as a Cat",
        description:
          "Turn yourself into a business cat with a suit, tie, and bandana - perfect for the corporate jungle.",
        category: "other",
        prompt:
          "Transform the person into a photorealistic cat wearing business attire including a suit, tie, and a purple bandana. Maintain the person's expression and personality traits.",
        previewImage: prisonCatImage,
        beforeImage: "/assets/couple-field.png",
        featured: true,
        new: true, 
        tags: ["pets", "transformation", "fun", "business", "cat"],
      },
      {
        id: "caricature",
        name: "Caricature",
        description:
          "Exaggerated features with humorous intent while maintaining recognition.",
        category: "other",
        prompt:
          "Transform into a skillful caricature with exaggerated yet recognizable features. Strategically enlarge the most distinctive facial elements by 20-30% while keeping overall facial arrangement intact. Simplify less important features for contrast with the exaggerated ones. Apply bold, confident pen or marker-style linework with vibrant watercolor or marker-style coloring. Enhance expressiveness with slightly enlarged eyes and exaggerated facial expression. Keep the body proportions smaller relative to the head (about 1:4 ratio). Add subtle details that emphasize personal characteristics, hobbies, or occupation. The final image should be immediately recognizable as the subject while being playful and humorous without crossing into mockery.",
        previewImage: "/caricature.png",
        beforeImage: "/assets/couple-field.png",
        popular: true,
        tags: ["funny", "portrait", "humorous"],
      },
      {
        id: "custom-other",
        name: "Create Your Own Fun Transformation",
        description: "Describe your own custom fun transformation like this beer-drinking deer.",
        category: "other",
        prompt: "",
        previewImage: beerDrinkingDeerImage,
        beforeImage: "/assets/couple-field.png",
        tags: ["custom", "creative", "fun"],
      },
    ];
  }

  // Function to save the selected style to localStorage
  const saveStylePrompt = (style: Style) => {
    // Save the selected style in localStorage for use on the home page
    localStorage.setItem(
      "selectedStyle",
      JSON.stringify({
        prompt: style.prompt,
        title: style.name,
        category: style.category,
      }),
    );

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
    ? selectedCategory === "other"
      ? {
          id: "other",
          name: "Fun/Viral Ideas",
          description:
            "Creative and trending transformations for social sharing",
          icon: "Sparkles",
          styles: [],
        }
      : categories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-[#2A7B9B]">
            {selectedCategory
              ? currentCategory?.name || "Transformation Styles"
              : "Transformation Ideas"}
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            {selectedCategory
              ? `Choose from our ${styles.length} ${currentCategory?.name.toLowerCase()} styles to transform your images.`
              : "Explore different categories and styles to inspire your next image transformation."}
          </p>
          <p className="text-base text-red-500 font-medium mt-2">
            Not all images with children in them will work with all prompts. AI is very strict about editing kids images (for good reason).
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
            {/* First two category cards */}
            {categories.slice(0, 2).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={setSelectedCategory}
              />
            ))}

            {/* Custom card in position 3 */}
            <Card className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-[#2A7B9B] hover:scale-[1.03] cursor-pointer">
              <div className="relative">
                {/* Background image with overlay */}
                <div className="h-64 overflow-hidden">
                  <img
                    src={funViralBackgroundImage}
                    alt="Fun/Viral Ideas"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 flex flex-col items-center justify-center px-4 py-8 text-center">
                    <Sparkles className="h-12 w-12 mb-2 text-white" />
                    <h3 className="text-xl font-bold mb-2 text-white">
                      Fun/Viral Ideas
                    </h3>

                    {/* Styles count */}
                    <div className="text-xs bg-white/20 text-white font-medium px-3 py-1 rounded-full mb-2">
                      9 styles
                    </div>

                    <p className="text-sm text-white/90 mb-4">
                      Creative and trending transformations for social sharing
                    </p>

                    {/* Explore Styles button with animated arrow */}
                    <Button
                      className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white mt-1 group"
                      onClick={() => setSelectedCategory("other")}
                    >
                      <span className="flex items-center">
                        Explore Styles
                        <ArrowRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Remaining category cards */}
            {categories.slice(2).map((category) => (
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
            <h3 className="text-lg font-semibold text-gray-700">
              No styles found
            </h3>
            <p className="text-gray-500 mb-6">
              There are no styles available in this category yet.
            </p>
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
