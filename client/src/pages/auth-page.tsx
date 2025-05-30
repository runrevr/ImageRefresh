import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import "@/components/ui/tabs-custom.css";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/auth?tab=:tab");
  const { toast } = useToast();
  
  // Default to the register tab unless login is explicitly specified
  const initialTab = params?.tab === "login" ? "login" : "register";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  
  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginUsername || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      username: loginUsername,
      password: loginPassword,
    });
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerUsername || !registerPassword || !registerConfirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (registerPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate({
      name: registerName,
      username: registerUsername,
      password: registerPassword,
      email: registerEmail || undefined,
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Auth form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-gray-600">Welcome to ImageRefresh</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start transforming your images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 tabs-custom">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input 
                      id="login-username" 
                      type="text" 
                      placeholder="Enter your username" 
                      value={loginUsername} 
                      onChange={(e) => setLoginUsername(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <a 
                        href="#" 
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.preventDefault();
                          toast({
                            title: "Reset Password",
                            description: "Password reset functionality coming soon",
                          });
                        }}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <PasswordInput 
                      id="login-password" 
                      placeholder="Enter your password" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in
                      </>
                    ) : "Log In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input 
                      id="register-name" 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={registerName} 
                      onChange={(e) => setRegisterName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username" 
                      type="text" 
                      placeholder="Choose a username" 
                      value={registerUsername} 
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <PasswordInput 
                      id="register-password" 
                      placeholder="Create a password" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <PasswordInput 
                      id="register-confirm-password" 
                      placeholder="Confirm your password" 
                      value={registerConfirmPassword} 
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
        
        {/* Hero section */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Transform your images with AI</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Create professional-quality visual content with our AI-powered transformation tools. 
              Perfect for marketers, designers, and content creators.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium mb-2">AI Image Transformations</h3>
              <p className="text-sm text-gray-600">
                Transform ordinary photos into extraordinary visuals with our AI
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium mb-2">Character Generation</h3>
              <p className="text-sm text-gray-600">
                Create animated characters from your photos with just a few clicks
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium mb-2">Product Photography</h3>
              <p className="text-sm text-gray-600">
                Enhanced product images with background removal and scene settings
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium mb-2">Custom Styles</h3>
              <p className="text-sm text-gray-600">
                Apply custom artistic styles to your images
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}