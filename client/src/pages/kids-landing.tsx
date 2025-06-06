import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import ImageUploader from "@/components/ImageUploader";
import PromptInput from "@/components/PromptInput";
import ProcessingState from "@/components/ProcessingState";
import ResultView from "@/components/ResultView";
import EditPrompt from "@/components/EditPrompt";
import AccountNeededDialog from "@/components/AccountNeededDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Heart, Palette, Sparkles, Sun, Smile } from "lucide-react";
import { TextRotate } from "@/components/ui/text-rotate";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

// Import transformation examples
import bearDrawingImage from "../assets/bear-drawing.png";
import bearRealImage from "../assets/bear-real.png";
import giraffeDrawingImage from "../assets/giraffe-drawing.png";
import giraffeRealImage from "../assets/giraffe-real.png";
import dogCatDrawingImage from "../assets/dog-and-cat-drawing.png";
import dogCatRealImage from "../assets/dog-and-cat-real.png";
import alicornDrawingImage from "../assets/alicorn-drawing.jpg";
import alicornRealImage from "../assets/alicorn-real.png";

// Import kids transformation examples
import kidsDrawingConverted from "../assets/kids-drawing-converted2.png";
import pixarUs from "../assets/pixar us.png";
import legoCharacter from "../assets/lego-character.png";
import minecraftCharacter from "../assets/mario.png";

// Enum for the different steps in the process
enum Step {
  Upload,
  Prompt,
  Processing,
  Result,
  Edit,
}

export default function KidsLanding() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [secondTransformedImage, setSecondTransformedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const { user: authUser, user } = useAuth();
  const [userCredits, setUserCredits] = useState<{
    totalCredits: number;
    paidCredits: number;
    freeCreditsUsed: boolean;
  }>({ totalCredits: 0, paidCredits: 0, freeCreditsUsed: true });
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [currentTransformation, setCurrentTransformation] = useState<any>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch user credits when user changes
  useEffect(() => {
    if (user) {
      fetch(`/api/credits/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setUserCredits({
            totalCredits: data.totalCredits || data.credits || 0,
            paidCredits: data.paidCredits || 0,
            freeCreditsUsed: data.freeCreditsUsed || false
          });
        })
        .catch(error => {
          console.error('Error fetching credits:', error);
        });
    }
  }, [user]);

  const handleUpload = (imagePath: string, imageUrl: string) => {
    if (!imagePath || !imageUrl) {
      toast({
        title: "Upload Error",
        description: "Could not process the uploaded image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setOriginalImage(imageUrl);
    setOriginalImagePath(imagePath);
    setCurrentStep(Step.Prompt);
  };

  const handlePromptSubmit = async (promptText: string, imageSize: string = "1024x1024") => {
    if (!originalImagePath) {
      toast({
        title: "Image Upload Error",
        description: "No image path found. Please try uploading your image again.",
        variant: "destructive",
      });
      setCurrentStep(Step.Upload);
      return;
    }

    setPrompt(promptText);
    setCurrentStep(Step.Processing);

    try {
      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath,
        prompt: promptText,
        userId: authUser?.id,
        imageSize: imageSize,
      });

      if (response.ok) {
        const data = await response.json();
        setTransformedImage(data.transformedImageUrl);
        if (data.secondTransformedImageUrl) {
          setSecondTransformedImage(data.secondTransformedImageUrl);
        }
        setCurrentTransformation(data);
        setCurrentStep(Step.Result);
      } else {
        const data = await response.json();
        toast({
          title: "Transformation failed",
          description: data.message || "An unknown error occurred during transformation",
          variant: "destructive",
        });
        setCurrentStep(Step.Prompt);
      }
    } catch (error: any) {
      console.error("Error transforming image:", error);
      toast({
        title: "Transformation Failed",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
      setCurrentStep(Step.Prompt);
    }
  };

  const handleNewImage = () => {
    setOriginalImage(null);
    setOriginalImagePath(null);
    setTransformedImage(null);
    setSecondTransformedImage(null);
    setPrompt("");
    setCurrentTransformation(null);
    setCurrentStep(Step.Upload);
    setShowUploadForm(false);
  };

  const handleTryNow = () => {
    // Navigate to upload page with kids/cartoons/animations pre-selected
    setLocation('/upload?category=kids');
  };

  return (
    <div className="text-gray-800 min-h-screen flex flex-col" style={{ backgroundColor: "white" }}>
      {/* Account Needed Dialog */}
      <AccountNeededDialog
        open={showAccountDialog}
        onClose={() => setShowAccountDialog(false)}
        email={null}
        isLoggedIn={Boolean(userCredits?.totalCredits)}
        remainingCredits={userCredits?.paidCredits || 0}
      />

      <main className="relative w-full">
        {/* Hero Section for Summer Survival Kit */}
        {currentStep === Step.Upload && !showUploadForm && (
          <>
            {/* Summer Kids Hero */}
            <div className="w-full bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 py-20">
              <div className="max-w-6xl mx-auto px-4 text-center">
                <div className="mb-8">
                  <Sun className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                    Summer Survival Kit for{" "}
                    <br className="hidden sm:block" />
                    <TextRotate
                      texts={[
                        "Busy Moms",
                        "Creative Kids", 
                        "Fun Times",
                        "Happy Families",
                        "Screen-Free Fun"
                      ]}
                      rotationInterval={2000}
                      staggerDuration={0.03}
                      initial={{ y: "50%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-50%", opacity: 0 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      mainClassName="text-orange-500 font-bold inline-block text-5xl md:text-6xl leading-[1.1] tracking-tight"
                      elementLevelClassName="font-bold text-5xl md:text-6xl"
                    />
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8">
                    Transform your kids into their favorite cartoon characters, turn drawings into coloring books, 
                    and create magical memories all summer long. Perfect for rainy days, quiet time, and creative fun!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4"
                    onClick={handleTryNow}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try Free Magic
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold text-lg px-8 py-4"
                    onClick={() => document.getElementById('summer-pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View Summer Plans
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Loved by 10,000+ Moms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Kid-Safe AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span>Screen-Time Alternative</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3x3 Transformation Grid */}
            <div className="w-full bg-gray-50 py-16">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Watch the Magic Happen
                  </h2>
                  <p className="text-lg text-gray-600">
                    From photos to cartoons to coloring books - endless summer fun!
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  {/* Column 1: Original Photos */}
                  <div className="flex flex-col gap-4">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <img 
                          src={pixarUs} 
                          alt="Kids Photo 1" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                        Original Photo
                      </div>
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <img 
                          src={bearDrawingImage} 
                          alt="Kids Drawing" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                        Kid's Drawing
                      </div>
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <img 
                          src={alicornDrawingImage} 
                          alt="Any Idea" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                        Any Idea
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Cartoon Transformations */}
                  <div className="flex flex-col gap-4">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                      <div className="p-4 flex items-center justify-center h-full">
                        <img 
                          src={minecraftCharacter} 
                          alt="Minecraft Character" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                      <div className="p-4 flex items-center justify-center h-full">
                        <img 
                          src={bearRealImage} 
                          alt="Realistic Bear" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                      <div className="p-4 flex items-center justify-center h-full">
                        <img 
                          src={alicornRealImage} 
                          alt="Magical Alicorn" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Coloring Book Pages */}
                  <div className="flex flex-col gap-4">
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <img 
                          src={legoCharacter} 
                          alt="Coloring Book 1" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="bg-orange-500 text-white text-center py-2 text-sm font-semibold">
                        Coloring Book
                      </div>
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Palette className="w-16 h-16 text-gray-400" />
                        </div>
                      </div>
                      <div className="bg-orange-500 text-white text-center py-2 text-sm font-semibold">
                        Coloring Book
                      </div>
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Palette className="w-16 h-16 text-gray-400" />
                        </div>
                      </div>
                      <div className="bg-orange-500 text-white text-center py-2 text-sm font-semibold">
                        Coloring Book
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Perfect for summer camps, playdates, quiet time, and creative adventures
                  </p>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3"
                    onClick={handleTryNow}
                  >
                    Start Creating Magic
                  </Button>
                </div>
              </div>
            </div>

            {/* Benefits for Moms */}
            <div className="w-full bg-white py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                  Why Moms Love Our Summer Kit
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Sun className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Beat Summer Boredom</h3>
                      <p className="text-gray-700">
                        Keep kids entertained for hours with magical transformations. 
                        Perfect for those "I'm bored" moments!
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-pink-100 hover:border-pink-200 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Palette className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Screen-Free Fun</h3>
                      <p className="text-gray-700">
                        Create coloring books instantly! Turn any photo or idea into 
                        printable coloring pages for offline creativity.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Heart className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3 text-gray-900">Memory Maker</h3>
                      <p className="text-gray-700">
                        Transform summer photos into cartoon masterpieces. 
                        Create unique keepsakes they'll treasure forever.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Before/After Examples */}
            <div className="w-full bg-gray-50 py-16">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    See Your Kids Come to Life
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    From everyday photos to cartoon adventures - watch the transformation magic
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={bearDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={bearRealImage} alt="Cartoon Transform" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={giraffeDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={giraffeRealImage} alt="Cartoon Transform" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={dogCatDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={dogCatRealImage} alt="Cartoon Transform" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={alicornDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={alicornRealImage} alt="Cartoon Transform" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4"
                    onClick={handleTryNow}
                  >
                    Try Magic Transformations
                  </Button>
                </div>
              </div>
            </div>

            {/* Summer Pricing */}
            <div id="summer-pricing" className="w-full bg-white py-16">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Choose Your Summer Adventure! 🌞
                  </h2>
                  <p className="text-xl text-gray-600">
                    Pick the perfect plan for endless summer creativity
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {/* Free Trial */}
                  <Card className="border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-800">Try Free</CardTitle>
                      <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                      <p className="text-gray-600">Perfect for testing the magic</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">1 free transformation to try</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">Access to all cartoon styles</span>
                        </li>
                        <li className="flex items-center">
                          <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-400">Limited to one image</span>
                        </li>
                        <li className="flex items-center">
                          <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-400">No coloring book creation</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-6"
                        onClick={() => setLocation('/upload?category=kids')}
                      >
                        Try Free Now
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Summer Special - Featured */}
                  <Card className="border-4 border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-xl transform scale-105 relative hover:shadow-2xl transition-shadow">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        SUMMER SPECIAL
                      </span>
                    </div>
                    <CardHeader className="text-center pb-4 pt-8">
                      <CardTitle className="text-2xl font-bold text-orange-600">Summer Unlimited</CardTitle>
                      <div className="text-5xl font-bold text-orange-600 mb-2">$19</div>
                      <p className="text-orange-700 font-semibold">3 months only!</p>
                      <p className="text-gray-700">Unlimited summer fun for the whole family</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Unlimited transformations</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">All cartoon styles included</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Create coloring book pages</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">HD downloads & saves</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm font-medium">Perfect for whole family</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-3 mt-6"
                        onClick={() => setLocation('/checkout-summer')}
                      >
                        Start Summer Fun! 🌞
                      </Button>
                      <p className="text-xs text-gray-600 text-center">Valid through August 31st • Cancel anytime</p>
                    </CardContent>
                  </Card>

                  {/* Monthly Plan */}
                  <Card className="border-2 border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-800">Monthly</CardTitle>
                      <div className="text-4xl font-bold text-blue-600 mb-2">$10</div>
                      <p className="text-gray-600">For ongoing creative fun</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">12 transformations per month</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">All cartoon & coloring styles</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">HD quality downloads</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">Image storage & history</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6"
                        onClick={() => setLocation('/pricing')}
                      >
                        Choose Monthly
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Trust indicators */}
                <div className="text-center mt-12 space-y-4">
                  <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="w-full bg-orange-50 py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                  What Moms Are Saying
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Card className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">
                        "This saved my sanity during summer break! My kids spent hours creating 
                        and coloring instead of asking for screen time. Total game changer!"
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold">Sarah M.</p>
                        <p className="text-gray-600">Mom of 3</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">
                        "My daughter turned herself into a Disney princess and we printed 
                        coloring books for her whole sleepover party. They were amazed!"
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold">Jessica T.</p>
                        <p className="text-gray-600">Mom of 2</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4">
                        "Perfect for rainy days! We transform family photos into cartoon 
                        adventures and make custom coloring books. Kids love it!"
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold">Amanda K.</p>
                        <p className="text-gray-600">Mom of 4</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="w-full bg-gradient-to-r from-orange-500 to-pink-500 py-16">
              <div className="max-w-4xl mx-auto px-4 text-center text-white">
                <h2 className="text-4xl font-bold mb-4">
                  Ready for Summer Magic?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of moms creating unforgettable summer memories with their kids.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-white text-orange-500 hover:bg-gray-100 font-bold text-lg px-8 py-4"
                    onClick={handleTryNow}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-orange-500 font-bold text-lg px-8 py-4"
                    onClick={() => setLocation('/checkout')}
                  >
                    Get Summer Plan
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Upload Form & Wizard Flow */}
        {(showUploadForm || currentStep !== Step.Upload) && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-10 max-w-3xl mx-auto">
            {currentStep === Step.Upload && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-3 text-center">
                  Upload Your Summer Photo
                </h2>
                <p className="text-gray-600 mb-4 text-center">
                  Transform into cartoons or create coloring book magic!
                </p>
                <ImageUploader onImageUploaded={handleUpload} />
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}

            {currentStep === Step.Prompt && originalImage && (
              <PromptInput
                originalImage={originalImage}
                onSubmit={handlePromptSubmit}
                onBack={handleNewImage}
                selectedTransformation={null}
                defaultPrompt="Transform this photo into a fun cartoon character perfect for kids, with bright colors and a magical, child-friendly style."
              />
            )}

            {currentStep === Step.Processing && originalImage && (
              <ProcessingState
                originalImage={originalImage}
                onCancel={() => setCurrentStep(Step.Prompt)}
                transformationId={currentTransformation?.id}
              />
            )}

            {currentStep === Step.Result && originalImage && transformedImage && (
              <ResultView
                originalImage={originalImage}
                transformedImage={transformedImage}
                secondTransformedImage={secondTransformedImage}
                onTryAgain={() => setCurrentStep(Step.Prompt)}
                onNewImage={handleNewImage}
                onEditImage={() => setCurrentStep(Step.Edit)}
                prompt={prompt}
                freeCredits={!userCredits?.freeCreditsUsed ? 1 : 0}
                paidCredits={userCredits?.paidCredits || 0}
                canEdit={true}
                transformationId={currentTransformation?.id?.toString()}
                editsUsed={currentTransformation?.editsUsed || 0}
                userId={authUser?.id}
              />
            )}

            {currentStep === Step.Edit && originalImage && transformedImage && (
              <EditPrompt
                originalImage={originalImage}
                transformedImage={transformedImage}
                initialPrompt={prompt}
                onSubmit={handlePromptSubmit}
                onSkip={() => setCurrentStep(Step.Result)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}