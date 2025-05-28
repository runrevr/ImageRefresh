
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Zap, Palette, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import styles from './ImageGenerationConfig.module.css';

interface ImageGenerationConfigProps {
  initialPrompt: string;
  onGenerate: (config: GenerationConfig) => void;
  onBack: () => void;
}

interface GenerationConfig {
  prompt: string;
  selectedSize: string;
  selectedStyle: string;
  selectedQuality: string;
}

const ImageGenerationConfig: React.FC<ImageGenerationConfigProps> = ({ 
  initialPrompt, 
  onGenerate, 
  onBack 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedQuality, setSelectedQuality] = useState('high');
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const sizeOptions = [
    { id: '1024x1024', label: '1024×1024', description: 'Square format' },
    { id: '1024x1792', label: '1024×1792', description: 'Portrait' },
    { id: '1792x1024', label: '1792×1024', description: 'Landscape' }
  ];

  const styleOptions = [
    { id: 'professional', label: 'Professional', description: 'Clean, business-ready style' },
    { id: 'artistic', label: 'Artistic', description: 'Creative and expressive' },
    { id: 'minimal', label: 'Minimal', description: 'Simple and clean' },
    { id: 'dramatic', label: 'Dramatic', description: 'Bold and impactful' }
  ];

  const qualityOptions = [
    { id: 'standard', label: 'Standard', description: 'Good quality, faster' },
    { id: 'high', label: 'High Quality', description: 'Best results, slower' }
  ];

  const handleGenerate = () => {
    onGenerate({
      prompt,
      selectedSize,
      selectedStyle,
      selectedQuality
    });
  };

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      {/* Header matching input page style */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1>Perfect Your Vision</h1>
        <p>Fine-tune your idea with AI assistance and professional options</p>
      </div>
      
      {/* Progress indicator */}
      <div className={styles.progressBar}>
        <div className={styles.progressStep}>1. Describe</div>
        <div className={`${styles.progressStep} ${styles.active}`}>2. Customize</div>
        <div className={styles.progressStep}>3. Generate</div>
      </div>
      
      <div className={styles.mainCard}>
        {/* Your Prompt Section with similar styling to input */}
        <div className={styles.promptSection}>
          <div className={styles.promptHeader}>
            <h2>Your Vision</h2>
            <span className={styles.promptLength}>{prompt.length} characters</span>
          </div>
          <textarea 
            className={styles.promptTextarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you need..."
            rows={3}
          />
        </div>

        {/* Size Selection */}
        <div className={styles.optionSection}>
          <div className={styles.optionHeader}>
            <ImageIcon className="w-5 h-5 mr-2" />
            <h3>Image Size</h3>
          </div>
          <div className={styles.optionGrid}>
            {sizeOptions.map((option) => (
              <Card 
                key={option.id}
                className={`${styles.optionCard} ${selectedSize === option.id ? styles.selected : ''}`}
                onClick={() => setSelectedSize(option.id)}
              >
                <CardContent className={styles.optionContent}>
                  <div className={styles.optionLabel}>{option.label}</div>
                  <div className={styles.optionDescription}>{option.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className={styles.optionSection}>
          <div className={styles.optionHeader}>
            <Palette className="w-5 h-5 mr-2" />
            <h3>Style</h3>
          </div>
          <div className={styles.optionGrid}>
            {styleOptions.map((option) => (
              <Card 
                key={option.id}
                className={`${styles.optionCard} ${selectedStyle === option.id ? styles.selected : ''}`}
                onClick={() => setSelectedStyle(option.id)}
              >
                <CardContent className={styles.optionContent}>
                  <div className={styles.optionLabel}>{option.label}</div>
                  <div className={styles.optionDescription}>{option.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Selection */}
        <div className={styles.optionSection}>
          <div className={styles.optionHeader}>
            <Zap className="w-5 h-5 mr-2" />
            <h3>Quality</h3>
          </div>
          <div className={styles.optionGrid}>
            {qualityOptions.map((option) => (
              <Card 
                key={option.id}
                className={`${styles.optionCard} ${selectedQuality === option.id ? styles.selected : ''}`}
                onClick={() => setSelectedQuality(option.id)}
              >
                <CardContent className={styles.optionContent}>
                  <div className={styles.optionLabel}>{option.label}</div>
                  <div className={styles.optionDescription}>{option.description}</div>
                  {option.id === 'high' && (
                    <Badge variant="secondary" className={styles.optionBadge}>
                      Recommended
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className={styles.generateSection}>
          <Button
            onClick={handleGenerate}
            className={styles.generateButton}
            size="lg"
            disabled={!prompt.trim()}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Image
          </Button>
          <p className={styles.generateNote}>
            This will create your enhanced image based on the selected options
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationConfig;
