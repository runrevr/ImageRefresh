import { ImageGallery } from '@/components/ImageGallery';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <ImageGallery />
        </div>
      </div>
    </ProtectedRoute>
  );
}