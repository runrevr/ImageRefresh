
import React, { useState } from 'react';
import { Download, Edit, Share2, ZoomIn, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import styles from './GeneratedImageView.module.css';

interface GeneratedImageViewProps {
  imageUrl: string;
  prompt: string;
  metadata?: {
    model?: string;
    generatedAt?: string;
    dimensions?: string;
    fileSize?: string;
  };
  onDownload?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onZoom?: () => void;
  className?: string;
}

const GeneratedImageView: React.FC<GeneratedImageViewProps> = ({
  imageUrl,
  prompt,
  metadata,
  onDownload,
  onEdit,
  onShare,
  onZoom,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      if (onDownload) {
        onDownload();
      } else {
        // Default download behavior
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: 'Generated Image',
          text: prompt,
          url: imageUrl
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(imageUrl);
      }
    }
  };

  const handleZoom = () => {
    if (onZoom) {
      onZoom();
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <Card className={`${styles.container} ${className}`}>
      <CardContent className={styles.content}>
        {/* Image Display Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {!imageLoaded && (
              <div className={styles.imagePlaceholder}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading image...</p>
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={prompt}
              className={`${styles.generatedImage} ${imageLoaded ? styles.loaded : styles.loading}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            
            {/* Image Overlay Actions */}
            <div className={styles.imageOverlay}>
              <Button
                variant="ghost"
                size="sm"
                className={styles.overlayButton}
                onClick={handleZoom}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${styles.overlayButton} ${isFavorited ? styles.favorited : ''}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Prompt Section */}
        <div className={styles.promptSection}>
          <h3 className={styles.promptTitle}>Generated Image</h3>
          <p className={styles.promptText}>{prompt}</p>
        </div>

        {/* Metadata Section */}
        {metadata && (
          <div className={styles.metadataSection}>
            <div className={styles.metadataGrid}>
              {metadata.model && (
                <Badge variant="secondary" className={styles.metadataBadge}>
                  {metadata.model}
                </Badge>
              )}
              {metadata.dimensions && (
                <span className={styles.metadataItem}>{metadata.dimensions}</span>
              )}
              {metadata.fileSize && (
                <span className={styles.metadataItem}>{metadata.fileSize}</span>
              )}
              {metadata.generatedAt && (
                <span className={styles.metadataItem}>
                  {new Date(metadata.generatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className={styles.primaryActions}>
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            className={styles.actionButton}
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Downloading...' : 'Download'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEdit}
            className={styles.actionButton}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className={styles.actionButton}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={styles.moreButton}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedImageView;
