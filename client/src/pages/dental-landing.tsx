
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ImageUploader from "@/components/ImageUploader";
import PromptInput from "@/components/PromptInput";
import ProcessingState from "@/components/ProcessingState";
import ResultView from "@/components/ResultView";
import EditPrompt from "@/components/EditPrompt";
import Footer from "@/components/Footer";
import AccountNeededDialog from "@/components/AccountNeededDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Heart, Smile } from "lucide-react";
import { TextRotate } from "@/components/ui/text-rotate";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFreeCredits } from "@/hooks/useFreeCredits";

// Import transformation examples
import bearDrawingImage from "../assets/bear-drawing.png";
import bearRealImage from "../assets/bear-real.png";
import giraffeDrawingImage from "../assets/giraffe-drawing.png";
import giraffeRealImage from "../assets/giraffe-real.png";
import dogCatDrawingImage from "../assets/dog-and-cat-drawing.png";
import dogCatRealImage from "../assets/dog-and-cat-real.png";
import alicornDrawingImage from "../assets/alicorn-drawing.jpg";
import alicornRealImage from "../assets/alicorn-real.png";

// Enum for the different steps in the process
enum Step {
  Upload,
  Prompt,
  Processing,
  Result,
  Edit,
}

export default function DentalLanding() {
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

  const handleUploadClick = () => {
    if (userCredits?.totalCredits) {
      setShowUploadForm(true);
    } else {
      setShowAccountDialog(true);
    }
  };

  return (
    <div className="text-gray-800 min-h-screen flex flex-col" style={{ backgroundColor: "white" }}>
      <Navbar
        freeCredits={!userCredits?.freeCreditsUsed ? 1 : 0}
        paidCredits={userCredits?.paidCredits || 0}
      />

      {/* Account Needed Dialog */}
      <AccountNeededDialog
        open={showAccountDialog}
        onClose={() => setShowAccountDialog(false)}
        email={null}
        isLoggedIn={Boolean(userCredits?.totalCredits)}
        remainingCredits={userCredits?.paidCredits || 0}
      />

      <main className="relative w-full" style={{ paddingTop: '4rem' }}>
        {/* Hero Section for Dental Practices */}
        {currentStep === Step.Upload && !showUploadForm && (
          <>
            {/* Dental-Specific Hero */}
            <div className="w-full bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
              <div className="max-w-6xl mx-auto px-4 text-center">
                <div className="mb-8">
                  <Smile className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                    Make Every Visit{" "}
                    <br className="hidden sm:block" />
                    <TextRotate
                      texts={[
                        "Magical",
                        "Exciting", 
                        "Fun",
                        "Special",
                        "Amazing"
                      ]}
                      rotationInterval={2000}
                      staggerDuration={0.03}
                      initial={{ y: "50%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-50%", opacity: 0 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      mainClassName="text-primary-500 font-bold inline-block text-5xl md:text-6xl leading-[1.1] tracking-tight"
                      elementLevelClassName="font-bold text-5xl md:text-6xl"
                    />
                    {" "}for Kids
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8">
                    Transform your young patients' drawings into stunning reality with AI. 
                    Reduce anxiety, create excitement, and make dental visits something kids actually look forward to.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button
                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-8 py-4"
                    onClick={handleUploadClick}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Try Free Demo
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-bold text-lg px-8 py-4"
                    onClick={() => document.getElementById('dental-pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View Pricing
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-tertiary-500" />
                    <span>Loved by 500+ Dental Practices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-secondary-500" />
                    <span>Safe & Child-Friendly AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-primary-500" />
                    <span>Reduces Dental Anxiety</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3x3 Image Grid - Before/After/Coloring Book */}
            <div className="w-full bg-gray-50 py-16">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    See the Magic Happen
                  </h2>
                  <p className="text-lg text-gray-600">
                    From simple drawings to stunning transformations and coloring book adventures
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Row 1: Before Images */}
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={bearDrawingImage} 
                      alt="Child's bear drawing" 
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                      Original Drawing
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={giraffeDrawingImage} 
                      alt="Child's giraffe drawing" 
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                      Original Drawing
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={dogCatDrawingImage} 
                      alt="Child's dog and cat drawing" 
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                      Original Drawing
                    </div>
                  </div>

                  {/* Row 2: After Images */}
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={bearRealImage} 
                      alt="AI transformed bear" 
                      className="w-full h-full object-cover"
                    />
                    <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                      AI Transformation
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={giraffeRealImage} 
                      alt="AI transformed giraffe" 
                      className="w-full h-full object-cover"
                    />
                    <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                      AI Transformation
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={dogCatRealImage} 
                      alt="AI transformed dog and cat" 
                      className="w-full h-full object-cover"
                    />
                    <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                      AI Transformation
                    </div>
                  </div>

                  {/* Row 3: Coloring Book Images */}
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4">
                        <Heart className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Coloring Book Style</p>
                      </div>
                    </div>
                    <div className="bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                      Coloring Book
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4">
                        <Smile className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Coloring Book Style</p>
                      </div>
                    </div>
                    <div className="bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                      Coloring Book
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-white">
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-4">
                        <Star className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Coloring Book Style</p>
                      </div>
                    </div>
                    <div className="bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                      Coloring Book
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Perfect for keeping kids engaged before, during, and after their dental visit
                  </p>
                  <Button
                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3"
                    onClick={handleUploadClick}
                  >
                    Try It Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Benefits for Dental Practices */}
            <div className="w-full bg-white py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                  Why Dental Practices Love ImageRefresh
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="border-2 border-primary-100 hover:border-primary-200 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Smile className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3">Reduce Anxiety</h3>
                      <p className="text-gray-600">
                        Turn nervous kids into excited patients by bringing their drawings to life. 
                        Create positive associations with dental visits.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-secondary-100 hover:border-secondary-200 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Heart className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3">Build Relationships</h3>
                      <p className="text-gray-600">
                        Create magical moments that kids and parents will never forget. 
                        Strengthen patient loyalty and referrals.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-accent-100 hover:border-accent-200 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Star className="w-12 h-12 text-accent-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-3">Stand Out</h3>
                      <p className="text-gray-600">
                        Be the most innovative dental practice in your area. 
                        Create social media buzz and word-of-mouth marketing.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Kids Drawing Transformation Examples */}
            <div className="w-full bg-gray-50 py-16">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Watch Kids' Drawings Come to Life
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Perfect for waiting rooms, consultation conversations, and creating unforgettable moments
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={bearDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={bearRealImage} alt="AI Transformation" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={giraffeDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={giraffeRealImage} alt="AI Transformation" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={dogCatDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={dogCatRealImage} alt="AI Transformation" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={alicornDrawingImage} alt="Child's Drawing" className="w-full h-full object-contain" />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Before</div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img src={alicornRealImage} alt="AI Transformation" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">After</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-8 py-4"
                    onClick={handleUploadClick}
                  >
                    Try It Now - Free Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Dental Practice Pricing */}
            <div id="dental-pricing" className="w-full bg-white py-16">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Special Pricing for Dental Practices
                  </h2>
                  <p className="text-xl text-gray-600">
                    Transform unlimited kids' drawings for one low monthly price
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <Card className="border-4 border-primary-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 bg-primary-500 text-white text-center py-2 font-bold">
                      🦷 DENTAL PRACTICE SPECIAL 🦷
                    </div>
                    <CardContent className="p-8 pt-16">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Unlimited Dental Plan
                        </h3>
                        <div className="text-6xl font-bold text-primary-500 mb-2">
                          $75
                          <span className="text-2xl text-gray-600">/month</span>
                        </div>
                        <p className="text-gray-600 mb-8">Perfect for dental practices</p>
                        
                        <ul className="space-y-4 mb-8 text-left">
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span><strong>Unlimited</strong> kids drawing transformations</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span>HD resolution output perfect for printing</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span>Multiple staff accounts included</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span>Commercial usage rights</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span>Priority customer support</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span>Cancel anytime</span>
                          </li>
                        </ul>

                        <Button 
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg py-4"
                          onClick={() => setLocation('/checkout-dental')}
                        >
                          Start Your Practice Plan
                        </Button>
                        
                        <p className="text-sm text-gray-500 mt-4">
                          7-day free trial • No setup fees
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center mt-8">
                  <p className="text-gray-600 mb-4">
                    <strong>Questions?</strong> We'd love to help you get started.
                  </p>
                  <Button 
                    variant="outline"
                    className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                  >
                    Schedule a Demo Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="w-full bg-primary-50 py-16">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                  What Dental Professionals Say
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
                        "This has completely transformed how kids feel about coming to our practice. 
                        We've seen a 40% reduction in anxiety-related appointments!"
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold">Dr. Sarah Johnson</p>
                        <p className="text-gray-600">Sunshine Pediatric Dentistry</p>
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
                        "Parents are amazed and kids can't wait to come back. 
                        It's the best investment we've made in patient experience."
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold">Dr. Michael Chen</p>
                        <p className="text-gray-600">Happy Smiles Family Dental</p>
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
                        "The unlimited plan pays for itself with just one new patient referral. 
                        Our social media engagement has skyrocketed!"
                      </p>
                      <div className="text-sm">
                        <p className="font-semibold">Dr. Lisa Rodriguez</p>
                        <p className="text-gray-600">Little Teeth Big Smiles</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 py-16">
              <div className="max-w-4xl mx-auto px-4 text-center text-white">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Transform Your Practice?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join hundreds of dental practices creating magical moments for kids every day.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-white text-primary-500 hover:bg-gray-100 font-bold text-lg px-8 py-4"
                    onClick={handleUploadClick}
                  >
                    Try Free Demo
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary-500 font-bold text-lg px-8 py-4"
                    onClick={() => setLocation('/checkout-dental')}
                  >
                    Start Unlimited Plan
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
                  Upload a Child's Drawing
                </h2>
                <p className="text-gray-600 mb-4 text-center">
                  Watch their imagination come to life with our AI transformation!
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
                defaultPrompt="Transform this child's drawing into a realistic, magical version while keeping the same characters, colors, and innocent charm. Make it look like a professional children's book illustration."
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

      <Footer />
    </div>
  );
}
