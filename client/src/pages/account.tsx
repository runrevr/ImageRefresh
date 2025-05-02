import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Transformation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Layout } from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState("");
  
  // Set the initial email when user data loads
  useEffect(() => {
    if (user && user.email) {
      setUpdatedEmail(user.email);
    }
  }, [user]);
  
  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error("You must be logged in");
      const res = await apiRequest("POST", "/api/update-email", { userId: user.id, email });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update email");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], { ...user, email: updatedEmail });
      toast({
        title: "Profile Updated",
        description: "Your email has been successfully updated.",
      });
      setIsUpdateModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle submit
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateEmailMutation.mutateAsync(updatedEmail);
    } finally {
      setIsUpdating(false);
    }
  };

  // Check for tab parameter to activate the right tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");

    if (
      tabParam &&
      ["profile", "transformations", "credits"].includes(tabParam)
    ) {
      console.log(`Setting active tab to: ${tabParam}`);
      setActiveTab(tabParam);
      // Clean URL after setting tab
      navigate("/account", { replace: true });
    }
  }, [location, navigate]); // Add location to dependencies to detect URL changes

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
    enabled: !!user,
  });

  // Fetch payment history
  const { data: paymentData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/user/payment-history"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/user/payment-history");
      if (!res.ok) throw new Error("Failed to fetch payment history");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch user transformations
  const { data: transformations, isLoading: transformationsLoading } = useQuery<
    any[]
  >({
    queryKey: ["/api/transformations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", `/api/transformations/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch transformations");
      return res.json();
    },
    enabled: !!user,
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
          
          {/* Profile Update Dialog */}
          <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="your-email@example.com"
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="mr-2">Saving...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
                      <p className="text-white">
                        {user.email || "No email provided"}
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" onClick={() => setIsUpdateModalOpen(true)}>
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
                  <CardDescription>
                    View your image transformation history
                  </CardDescription>
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
                        <div
                          key={transformation.id}
                          className="border rounded-lg overflow-hidden"
                        >
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
                                      {transformation.status === "pending"
                                        ? "Pending"
                                        : "Processing"}
                                      ...
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-gray-500">
                              {transformation.createdAt
                                ? formatDistanceToNow(
                                    new Date(transformation.createdAt),
                                    { addSuffix: true },
                                  )
                                : "Date unknown"}
                            </p>
                            <p className="text-sm mt-1 line-clamp-2">
                              {transformation.prompt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        You haven't created any transformations yet.
                      </p>
                      <Button onClick={() => navigate("/")}>
                        Create Your First Transformation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="credits">
              <Card>
                <CardHeader>
                  <CardTitle>Your Credits</CardTitle>
                  <CardDescription>
                    Manage your subscription and credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      {/* <h3 className="text-xl font-bold mb-2 text-[#333333]">
                        Available Credits
                      </h3> */}
                      <p className="text-4xl font-bold text-[#333333]">
                        {(() => {
                          // Safely determine if free credit is available
                          const freeCredit =
                            subscriptionData?.freeCreditsUsed === true ||
                            user?.freeCreditsUsed === true
                              ? 0
                              : 1;
                          // Safely get paid credits
                          const paidCredits =
                            subscriptionData?.credits || user?.paidCredits || 0;
                          // Calculate total
                          const totalCredits = freeCredit + paidCredits;
                          return (
                            <>
                              {totalCredits}{" "}
                              <span className="text-gray-500 text-lg ml-1">
                                {totalCredits === 1 ? "credit" : "credits"}
                              </span>
                            </>
                          );
                        })()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {subscriptionData?.freeCreditsUsed === true ||
                        user?.freeCreditsUsed === true
                          ? "You've used your free monthly credit"
                          : "Includes your free monthly credit"}
                      </p>
                      {subscriptionData?.subscriptionTier &&
                        subscriptionData?.subscriptionStatus === "active" && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm font-medium text-green-600">
                              Active{" "}
                              {subscriptionData.subscriptionTier === "basic"
                                ? "Basic"
                                : "Premium"}{" "}
                              Subscription
                            </p>
                          </div>
                        )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Get More Credits
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="border rounded-lg p-4 text-center">
                          <h4 className="font-bold mb-1">1 Credit</h4>
                          <p className="text-2xl font-bold mb-2">$1.00</p>
                          <p className="text-sm text-gray-500 mb-4">
                            One-time purchase
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => navigate("/buy-credits")}
                          >
                            Buy Now
                          </Button>
                        </div>

                        <div className="border rounded-lg p-4 text-center bg-orange-50 border-orange-200 relative">
                          <span className="bg-[#FF7B54] text-white px-2 py-1 text-xs rounded-full absolute -top-2 -right-2">
                            BEST VALUE
                          </span>
                          <h4 className="font-bold mb-1">12 Credits</h4>
                          <p className="text-2xl font-bold mb-2">$10.00</p>
                          <p className="text-sm text-green-600 mb-4">
                            Save 16%
                          </p>
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
                          <p className="text-sm text-green-600 mb-4">
                            Save 33%
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => navigate("/buy-credits")}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="border rounded-lg p-4 text-center">
                          <h4 className="font-bold mb-1">100 Credits</h4>
                          <p className="text-2xl font-bold mb-2">$50.00</p>
                          <p className="text-sm text-green-600 mb-4">
                            Save 50%
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => navigate("/buy-credits")}
                          >
                            Buy Now
                          </Button>
                        </div>

                        <div className="border rounded-lg p-4 text-center bg-blue-50 border-blue-200">
                          <h4 className="font-bold mb-1">
                            Monthly Subscription Plans
                          </h4>
                          <p className="mb-4">
                            Get credits monthly with our subscription plans starting at $10/month
                          </p>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("/pricing")}
                          >
                            View Subscription Plans
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Billing History
                      </h3>
                      <div className="bg-white rounded-lg border">
                        <div className="divide-y">
                          {paymentsLoading ? (
                            <div className="p-4">
                              <Skeleton className="h-16 w-full mb-4" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                          ) : paymentData &&
                            paymentData.payments &&
                            paymentData.payments.length > 0 ? (
                            paymentData.payments.map((payment: any) => (
                              <div
                                key={payment.id}
                                className="p-4 flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">
                                    {payment.description}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(
                                      payment.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    ${(payment.amount / 100).toFixed(2)}
                                  </p>
                                  <p
                                    className={`text-xs ${payment.status === "succeeded" ? "text-green-600" : payment.status === "pending" ? "text-yellow-600" : "text-red-600"}`}
                                  >
                                    {payment.status === "succeeded"
                                      ? "Success"
                                      : payment.status === "pending"
                                        ? "Pending"
                                        : "Failed"}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-gray-500">
                                No billing history available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Need help with your billing?{" "}
                          <a
                            href="mailto:support@imagerefresh.ai"
                            className="text-blue-600 hover:underline"
                          >
                            Contact Support
                          </a>
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
