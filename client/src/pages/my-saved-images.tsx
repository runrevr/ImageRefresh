import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Download, Share2, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SavedImage {
  id: number;
  userId: number;
  imagePath: string;
  imageUrl: string;
  originalPrompt: string | null;
  imageType: string;
  category: string;
  transformationId: number | null;
  originalImagePath: string | null;
  fileSize: number | null;
  dimensions: string | null;
  isVariant: boolean;
  parentImageId: number | null;
  expiresAt: string;
  createdAt: string;
}

export default function MySavedImages() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all user images directly
  const { data: images = [], isLoading, error } = useQuery<SavedImage[]>({
    queryKey: ['/api/user-images', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/user-images/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved images');
      }
      return response.json();
    },
  });

  const personalImages = images.filter(img => img.category === 'personal');
  const productImages = images.filter(img => img.category === 'product');

  const handleDownload = async (image: SavedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${image.id}.png`;
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
        description: "Could not download the image.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (image: SavedImage) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Image',
          text: image.originalPrompt || 'Check out this AI image!',
          url: image.imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(image.imageUrl);
        toast({
          title: "Link copied",
          description: "Image URL copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share the image.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your saved images.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Images</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const ImageGrid = ({ images }: { images: SavedImage[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <Card key={image.id} className="group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={image.imageUrl}
                alt={image.originalPrompt || 'AI Generated Image'}
                className="w-full h-48 object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OWFhMiI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                </div>
              </div>

              {image.isVariant && (
                <Badge className="absolute top-2 left-2 bg-blue-600">
                  Variant
                </Badge>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {image.imageType}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(image.createdAt)}
                </span>
              </div>
              
              {image.originalPrompt && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {image.originalPrompt.length > 80 
                    ? `${image.originalPrompt.substring(0, 80)}...` 
                    : image.originalPrompt}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Expires in {getExpiryDays(image.expiresAt)} days</span>
                <Badge variant={image.category === 'product' ? 'default' : 'secondary'} className="text-xs">
                  {image.category}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Saved Images</h1>
          <p className="text-gray-600">
            Your AI-generated images are automatically saved for 45 days. Download them to keep permanently.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved images yet</h3>
            <p className="text-gray-500 mb-6">Start creating transformations to build your collection!</p>
            <Button onClick={() => window.location.href = '/upload'}>
              Create Your First Image
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Images ({images.length})</TabsTrigger>
              <TabsTrigger value="personal">Personal ({personalImages.length})</TabsTrigger>
              <TabsTrigger value="product">Product ({productImages.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <ImageGrid images={images} />
            </TabsContent>
            
            <TabsContent value="personal" className="mt-6">
              {personalImages.length > 0 ? (
                <ImageGrid images={personalImages} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No personal images yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="product" className="mt-6">
              {productImages.length > 0 ? (
                <ImageGrid images={productImages} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No product images yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}