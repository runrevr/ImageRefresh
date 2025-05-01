import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Transformation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  // Fetch subscription status
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/user/subscription"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/user/subscription");
      if (!res.ok) throw new Error("Failed to fetch subscription data");
      return res.json();
    },
    enabled: !!user
  });
  
  // Fetch user transformations
  const { data: transformations, isLoading: transformationsLoading } = useQuery<any[]>({
    queryKey: ["/api/transformations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", `/api/transformations/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch transformations");
      return res.json();
    },
    enabled: !!user
  });
  
  if (authLoading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Account</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="transformations">My Images</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Username</h3>
                      <p className="text-white">{user.username}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Email</h3>
                      <p className="text-white">{user.email || "No email provided"}</p>
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline" onClick={() => {}}>
                        Update Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            Available Credits
            <TabsContent value="transformations">
              <Card>
                <CardHeader>
                  <CardTitle>My Transformations</CardTitle>
                  <CardDescription>View your image transformation history</CardDescription>
                </CardHeader>
                <CardContent>
                  {transformationsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  ) : transformations && transformations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {transformations.map((transformation) => (
                        <div key={transformation.id} className="border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="aspect-square relative bg-gray-100">
                              <img 
                                src={transformation.originalImageUrl} 
                                alt="Original" 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                Original
                              </div>
                            </div>
                            <div className="aspect-square relative bg-gray-100">
                              {transformation.transformedImageUrl ? (
                                <>
                                  <img 
                                    src={transformation.transformedImageUrl} 
                                    alt="Transformed" 
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                    Transformed
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {transformation.status === "failed" ? (
                                    <p className="text-red-500 text-sm text-center p-2">
                                      Transformation failed
                                    </p>
                                  ) : (
                                    <p className="text-gray-500 text-sm text-center p-2">
                                      {transformation.status === "pending" ? "Pending" : "Processing"}...
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-gray-500">
                              {transformation.createdAt ? (
                                formatDistanceToNow(new Date(transformation.createdAt), { addSuffix: true })
                              ) : (
                                "Date unknown"
                              )}
                            </p>
                            <p className="text-sm mt-1 line-clamp-2">{transformation.prompt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't created any transformations yet.</p>
                      <Button onClick={() => navigate("/")}>Create Your First Transformation</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="credits">
              <Card>
                <CardHeader>
                  <CardTitle>Your Credits</CardTitle>
                  <CardDescription>Manage your subscription and credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h3 className="text-xl font-bold mb-2 text-[#333333]">Available Credits</h3>
                      <p className="text-4xl font-bold text-[#333333]">
                        {(() => {
                          // Safely determine if free credit is available
                          const freeCredit = (subscriptionData?.freeCreditsUsed === true || user?.freeCreditsUsed === true) ? 0 : 1;
                          // Safely get paid credits
                          const paidCredits = subscriptionData?.credits || user?.paidCredits || 0;
                          // Calculate total
                          const totalCredits = freeCredit + paidCredits;
                          return (
                            <>
                              {totalCredits} <span className="text-gray-500 text-lg ml-1">{totalCredits === 1 ? 'credit' : 'credits'}</span>
                            </>
                          );
                        })()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {subscriptionData?.freeCreditsUsed === true || user?.freeCreditsUsed === true ? 
                          "You've used your free monthly credit" : 
                          "Includes your free monthly credit"}
                      </p>
                      {subscriptionData?.subscriptionTier && subscriptionData?.subscriptionStatus === 'active' && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium text-green-600">
                            Active {subscriptionData.subscriptionTier === 'basic' ? 'Basic' : 'Premium'} Subscription
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Get More Credits</h3>
                      
                      {/* Check if user has an active subscription */}
                      {(subscriptionData?.hasActiveSubscription || subscriptionData?.subscriptionStatus === 'active') ? (
                        <>
                          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="font-medium text-green-800">
                              You have an active subscription! You can purchase additional credits.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="border rounded-lg p-4 text-center">
                              <h4 className="font-bold mb-1">1 Credit</h4>
                              <p className="text-2xl font-bold mb-2">$1.00</p>
                              <p className="text-sm text-gray-500 mb-4">One-time purchase</p>
                              <Button 
                                className="w-full" 
                                onClick={() => navigate("/buy-credits")}
                              >
                                Buy Now
                              </Button>
                            </div>
                            
                            <div className="border rounded-lg p-4 text-center bg-blue-50 border-blue-200 relative">
                              <span className="bg-[#FF7B54] text-white px-2 py-1 text-xs rounded-full absolute -top-2 -right-2">
                                BEST VALUE
                              </span>
                              <h4 className="font-bold mb-1">12 Credits</h4>
                              <p className="text-2xl font-bold mb-2">$10.00</p>
                              <p className="text-sm text-green-600 mb-4">Save 16%</p>
                              <Button 
                                className="w-full bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white" 
                                onClick={() => navigate("/buy-credits")}
                              >
                                Buy Now
                              </Button>
                            </div>
                            
                            <div className="border rounded-lg p-4 text-center">
                              <h4 className="font-bold mb-1">30 Credits</h4>
                              <p className="text-2xl font-bold mb-2">$20.00</p>
                              <p className="text-sm text-green-600 mb-4">Save 33%</p>
                              <Button 
                                className="w-full" 
                                onClick={() => navigate("/buy-credits")}
                              >
                                Buy Now
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div className="border rounded-lg p-4 text-center bg-gray-50">
                              <h4 className="font-bold mb-1">Need More Credits?</h4>
                              <p className="mb-4">Consider upgrading your subscription</p>
                              <Button 
                                variant="outline"
                                className="w-full" 
                                onClick={() => navigate("/pricing")}
                              >
                                View Subscription Plans
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4 text-center">
                            <h4 className="font-bold mb-1">10 Credits</h4>
                            <p className="text-2xl font-bold mb-2">$10/mo</p>
                            <p className="text-sm text-gray-500 mb-4">Monthly subscription</p>
                            <Button 
                              className="w-full" 
                              onClick={() => navigate("/checkout")}
                            >
                              Subscribe Now
                            </Button>
                          </div>
                          <div className="border rounded-lg p-4 text-center bg-blue-50 border-blue-200 relative">
                            <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded-full absolute -top-2 -right-2">
                              BEST VALUE
                            </span>
                            <h4 className="font-bold mb-1 text-[#333333]">30 Credits</h4>
                            <p className="text-2xl font-bold mb-2 text-[#333333]">$20/mo</p>
                            <p className="text-sm text-gray-500 mb-4">Monthly subscription</p>
                            <p className="text-[#333333] mb-3 text-sm font-medium">
                              ✨ Get 50% more value! ✨<br />
                              Upgrade to our $20 package and receive 30 credits instead of just 20 credits at the standard rate. 🚀 💰
                            </p>
                            <Button 
                              className="w-full bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white" 
                              onClick={() => navigate("/subscribe")}
                            >
                              Subscribe Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Billing History</h3>
                      <div className="bg-white rounded-lg border">
                        <div className="divide-y">
                          {/* Mock billing history - to be replaced with real data */}
                          <div className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">30 Credit Subscription</p>
                              <p className="text-sm text-gray-500">Apr 26, 2025</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$20.00</p>
                              <p className="text-xs text-green-600">Success</p>
                            </div>
                          </div>
                          
                          <div className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">12 Credit Pack</p>
                              <p className="text-sm text-gray-500">Apr 12, 2025</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$10.00</p>
                              <p className="text-xs text-green-600">Success</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Need help with your billing? <a href="mailto:support@imagerefresh.ai" className="text-blue-600 hover:underline">Contact Support</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}