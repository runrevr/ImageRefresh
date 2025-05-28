
import React, { useState, useEffect } from 'react';
import { Check, Download, Share2, Edit, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import styles from './ConfirmationPage.module.css';

interface ConfirmationPageProps {
  generatedImage: string;
  originalPrompt: string;
  selectedSize: string;
  selectedStyle: string;
  onBack: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onNewGeneration: () => void;
  generationTime?: number;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  generatedImage,
  originalPrompt,
  selectedSize,
  selectedStyle,
  onBack,
  onEdit,
  onDownload,
  onNewGeneration,
  generationTime = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleShare = () => {
    setShowShareMenu(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    const shareText = `Check out this amazing AI-generated image: ${originalPrompt}`;
    const shareUrl = window.location.href;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      {/* Header with success state */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <div className={styles.successBadge}>
          <Check className="w-5 h-5 mr-2" />
          <span>Generation Complete!</span>
        </div>
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Sparkles className="w-6 h-6 mr-2" />
            Your Vision is Ready
          </h1>
          <p className={styles.subtitle}>
            Your AI-generated image has been created successfully
          </p>
        </div>
      </div>

      {/* Progress indicator - completed */}
      <div className={styles.progressBar}>
        <div className={`${styles.progressStep} ${styles.completed}`}>
          <Check className="w-4 h-4" />
          1. Describe
        </div>
        <div className={`${styles.progressStep} ${styles.completed}`}>
          <Check className="w-4 h-4" />
          2. Customize
        </div>
        <div className={`${styles.progressStep} ${styles.active}`}>
          <Check className="w-4 h-4" />
          3. Complete
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Generated Image Display */}
        <Card className={styles.imageCard}>
          <CardContent className={styles.imageContent}>
            <div className={styles.imageContainer}>
              {!imageLoaded && (
                <div className={styles.imageLoader}>
                  <div className={styles.spinner}></div>
                  <p>Loading your creation...</p>
                </div>
              )}
              <img
                src={generatedImage}
                alt="Generated artwork"
                className={`${styles.generatedImage} ${imageLoaded ? styles.loaded : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              
              {/* Image overlay with quick actions */}
              <div className={styles.imageOverlay}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onDownload}
                  className={styles.overlayButton}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className={styles.overlayButton}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Image metadata */}
            <div className={styles.imageMetadata}>
              <div className={styles.metadataGrid}>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Size:</span>
                  <Badge variant="secondary">{selectedSize}</Badge>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Style:</span>
                  <Badge variant="secondary">{selectedStyle}</Badge>
                </div>
                {generationTime > 0 && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Time:</span>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {generationTime}s
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Display */}
        <Card className={styles.promptCard}>
          <CardContent className={styles.promptContent}>
            <div className={styles.promptHeader}>
              <h3>Your Original Vision</h3>
              <span className={styles.promptLength}>{originalPrompt.length} characters</span>
            </div>
            <div className={styles.promptDisplay}>
              <p>{originalPrompt}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={styles.actionSection}>
          <div className={styles.primaryActions}>
            <Button
              onClick={onDownload}
              className={styles.downloadButton}
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download High Quality
            </Button>
            
            <Button
              variant="outline"
              onClick={onEdit}
              className={styles.editButton}
              size="lg"
            >
              <Edit className="w-5 h-5 mr-2" />
              Make Changes
            </Button>
          </div>
          
          <div className={styles.secondaryActions}>
            <Button
              variant="ghost"
              onClick={handleShare}
              className={styles.shareButton}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Creation
            </Button>
            
            <Button
              variant="ghost"
              onClick={onNewGeneration}
              className={styles.newButton}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Another
            </Button>
          </div>
        </div>
      </div>

      {/* Share Menu Modal */}
      {showShareMenu && (
        <>
          <div className={styles.shareOverlay} onClick={() => setShowShareMenu(false)} />
          <div className={styles.shareMenu}>
            <div className={styles.shareHeader}>
              <h3>Share Your Creation</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowShareMenu(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.shareOptions}>
              <button 
                className={styles.shareOption}
                onClick={handleCopyLink}
              >
                <span className={styles.shareIcon}>🔗</span>
                {linkCopied ? 'Link Copied!' : 'Copy Link'}
              </button>
              
              <button 
                className={styles.shareOption}
                onClick={() => handleSocialShare('twitter')}
              >
                <span className={styles.shareIcon}>🐦</span>
                Share on Twitter
              </button>
              
              <button 
                className={styles.shareOption}
                onClick={() => handleSocialShare('facebook')}
              >
                <span className={styles.shareIcon}>📘</span>
                Share on Facebook
              </button>
              
              <button 
                className={styles.shareOption}
                onClick={() => handleSocialShare('linkedin')}
              >
                <span className={styles.shareIcon}>💼</span>
                Share on LinkedIn
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfirmationPage;
