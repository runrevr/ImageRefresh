import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function TransformationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
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
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Transformations</h1>
        <Button onClick={() => navigate("/")}>Create New Transformation</Button>
      </div>
      
      {transformationsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : !transformations || transformations.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No Transformations Found</CardTitle>
            <CardDescription>
              You haven't created any image transformations yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>
              Create Your First Transformation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformations.map((transformation) => (
            <Card key={transformation.id} className="overflow-hidden">
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
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-500">
                    {transformation.createdAt ? (
                      formatDistanceToNow(new Date(transformation.createdAt), { addSuffix: true })
                    ) : (
                      "Date unknown"
                    )}
                  </p>
                  <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {transformation.status}
                  </div>
                </div>
                <p className="text-sm line-clamp-2">{transformation.prompt}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(transformation.originalImageUrl, '_blank')}
                  >
                    Original
                  </Button>
                  {transformation.transformedImageUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(transformation.transformedImageUrl, '_blank')}
                    >
                      Transformed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}