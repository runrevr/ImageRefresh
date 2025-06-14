import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";

interface UserImage {
  id: number;
  userId: number;
  imagePath: string;
  imageUrl: string;
  originalPrompt: string | null;
  imageType: string;
  createdAt: string;
  expiresAt: string;
}

export default function MyImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userCredits } = useCredits();
  const { user } = useAuth();

  const userId = user?.id;

  console.log('[MY-IMAGES] Component render - userId:', userId);

  const { data: images = [], isLoading, error, refetch } = useQuery<UserImage[]>({
    queryKey: ['user-images', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');

      console.log('[MY-IMAGES] Fetching images for user:', userId);
      const response = await fetch(`/api/user-images/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('[MY-IMAGES] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MY-IMAGES] API error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[MY-IMAGES] Raw API response:', data);

      // Handle different response formats
      let imageArray = [];
      if (Array.isArray(data)) {
        imageArray = data;
      } else if (data && Array.isArray(data.images)) {
        imageArray = data.images;
      } else if (data && typeof data === 'object') {
        console.warn('[MY-IMAGES] Unexpected response format:', data);
        imageArray = [];
      }

      console.log('[MY-IMAGES] Final image array:', imageArray);
      console.log('[MY-IMAGES] Image count:', imageArray.length);

      return imageArray;
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  console.log('[MY-IMAGES] Current state:', {
    userId,
    isLoading,
    error: error?.message,
    imageCount: images?.length || 0,
    hasImages: images && images.length > 0
  });

  const deleteImageMutation = useMutation({
    mutationFn: async ({ imageId, userId }: { imageId: number; userId: number }) => {
      const response = await fetch(`/api/user-images/${imageId}/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-images', userId] });
      toast({
        title: "Image deleted",
        description: "The image has been removed from your collection.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (imageId: number) => {
    if (!userId) return;
    deleteImageMutation.mutate({ imageId, userId: userId });
  };

  const handleDownload = async (imageUrl: string, originalPrompt: string | null) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const freeCredits = userCredits?.hasMonthlyFreeCredit ? 1 : 0;
  const paidCredits = userCredits?.paidCredits || 0;

  // Not logged in
  if (!userId) {
    return (
      <>
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in to view your images</h1>
            <p className="text-gray-600">You need to be logged in to access your saved images.</p>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">My Images</h1>
              <p className="text-gray-600">Loading your images...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Images</h1>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Images</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your enhanced and transformed images are saved here for 45 days. Download them to keep them permanently.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {images.length} image{images.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => {
                const daysLeft = getDaysUntilExpiry(image.expiresAt);
                const isExpiringSoon = daysLeft <= 7;

                return (
                  <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <img
                        src={image.imageUrl}
                        alt="Enhanced image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', image.imageUrl);
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(image.imageUrl, image.originalPrompt)}
                            className="bg-white hover:bg-gray-100"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {image.originalPrompt && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {image.originalPrompt}
                          </p>
                        )}

                        {image.imageType && (
                          <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                            {image.imageType}
                          </span>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{format(new Date(image.createdAt), 'MMM d, yyyy')}</span>
                          <span className={`${isExpiringSoon ? 'text-orange-600 font-medium' : ''}`}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No images found</h3>
                <p className="text-gray-600 mb-8">
                  Start creating and enhancing images to build your collection. All transformed images will be saved here automatically.
                </p>
                <Button
                  onClick={() => window.location.href = '/product-image-lab'}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3"
                >
                  Start Creating
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}