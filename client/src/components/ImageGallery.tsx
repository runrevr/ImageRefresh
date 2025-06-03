import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Share2, Trash2, Image as ImageIcon, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface UserImage {
  id: number;
  imagePath: string;
  imageUrl: string;
  originalPrompt?: string;
  imageType: string;
  category: string;
  transformationId?: number;
  originalImagePath?: string;
  fileSize?: number;
  dimensions?: string;
  isVariant: boolean;
  parentImageId?: number;
  expiresAt: string;
  createdAt: string;
}

interface CategorizedImages {
  personal: UserImage[];
  product: UserImage[];
}

export function ImageGallery() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'personal' | 'product'>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  console.log('[ImageGallery] Authentication state:', { user: !!user, userId: user?.id });

  // Fetch categorized images
  const { data: categorizedImages, isLoading, error } = useQuery<CategorizedImages>({
    queryKey: ['/api/user/images', 'categorized'],
    enabled: isAuthenticated,
    retry: false,
    queryFn: async () => {
      console.log('[ImageGallery] Fetching images from API...');
      const response = await fetch('/api/user/images?category=categorized', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || '6'
        }
      });
      
      console.log('[ImageGallery] API response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`Failed to fetch images: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[ImageGallery] API response data:', data);
      return data;
    },
  });

  console.log('[ImageGallery] Query state:', { 
    isLoading, 
    error: error?.message, 
    hasData: !!categorizedImages,
    personalCount: categorizedImages?.personal?.length || 0,
    productCount: categorizedImages?.product?.length || 0
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/user/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/images'] });
      toast({
        title: "Image deleted",
        description: "The image has been successfully removed from your collection.",
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

  const handleDownload = async (image: UserImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transformed-image-${image.id}.png`;
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
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (image: UserImage) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Transformed Image',
          text: image.originalPrompt || 'Check out this AI-transformed image!',
          url: image.imageUrl,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(image.imageUrl);
        toast({
          title: "Link copied",
          description: "Image URL has been copied to your clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (imageId: number) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExpiryDays = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
        <p className="text-muted-foreground mb-6">Please sign in to view your saved images.</p>
        <Button onClick={() => window.location.href = '/auth'}>
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Images</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!categorizedImages) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No images found. Start creating to see your collection!</p>
      </div>
    );
  }

  const ImageGrid = ({ images }: { images: UserImage[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={image.imageUrl}
                alt={image.originalPrompt || 'Transformed image'}
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(image)}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleShare(image)}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Share2 className="w-4 h-4" />
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

              {/* Category badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  image.category === 'product' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {image.category === 'product' ? 'Product' : 'Personal'}
                </span>
              </div>

              {/* Variant indicator */}
              {image.isVariant && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    Variant
                  </span>
                </div>
              )}
            </div>

            {/* Image details */}
            <div className="p-3">
              <div className="text-sm font-medium mb-1 truncate">
                {image.originalPrompt || 'AI Transformation'}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Type: {image.imageType}</div>
                <div>Created: {formatDate(image.createdAt)}</div>
                <div className="flex items-center justify-between">
                  <span>Expires in: {getExpiryDays(image.expiresAt)} days</span>
                  {image.dimensions && (
                    <span>{image.dimensions}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const totalImages = categorizedImages.personal.length + categorizedImages.product.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Image Collection</h2>
        <div className="text-sm text-muted-foreground">
          {totalImages} image{totalImages !== 1 ? 's' : ''} • 45-day retention
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>All ({totalImages})</span>
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>Personal ({categorizedImages.personal.length})</span>
          </TabsTrigger>
          <TabsTrigger value="product" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Product ({categorizedImages.product.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {totalImages === 0 ? (
            <div className="text-center p-8">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images in your collection yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start creating AI transformations to build your gallery!
              </p>
            </div>
          ) : (
            <ImageGrid images={[...categorizedImages.personal, ...categorizedImages.product]} />
          )}
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          {categorizedImages.personal.length === 0 ? (
            <div className="text-center p-8">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No personal images yet.</p>
            </div>
          ) : (
            <ImageGrid images={categorizedImages.personal} />
          )}
        </TabsContent>

        <TabsContent value="product" className="mt-6">
          {categorizedImages.product.length === 0 ? (
            <div className="text-center p-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No product images yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Use product-related prompts to automatically categorize images here.
              </p>
            </div>
          ) : (
            <ImageGrid images={categorizedImages.product} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}