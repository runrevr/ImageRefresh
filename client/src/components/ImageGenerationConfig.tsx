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
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 'ai-suggestion-1',
      text: 'A futuristic cityscape with towering skyscrapers and flying vehicles, bathed in neon lights.',
      icon: '🏙️',
      type: 'Futuristic',
      tags: ['cityscape', 'futuristic', 'neon', 'skyscrapers', 'vehicles']
    },
    {
      id: 'ai-suggestion-2',
      text: 'A serene beach at sunset with gentle waves, palm trees, and vibrant colors.',
      icon: '🌅',
      type: 'Serene',
      tags: ['beach', 'sunset', 'waves', 'palm trees', 'vibrant']
    },
    {
      id: 'ai-suggestion-3',
      text: 'A majestic lion in the African savanna with golden fur and intense eyes.',
      icon: '🦁',
      type: 'Majestic',
      tags: ['lion', 'savanna', 'africa', 'golden fur', 'intense eyes']
    }
  ]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

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

  const enhanceWithAI = async () => {
    setLoadingAI(true);
    // Simulate AI processing with a timeout
    setTimeout(() => {
      setLoadingAI(false);
      setShowAISuggestions(true);
    }, 1500);
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

        {/* AI Enhancement Section */}
        <div className={styles.aiSection}>
          <button 
            className={`${styles.aiButton} ${loadingAI ? styles.loading : ''}`}
            onClick={enhanceWithAI}
            disabled={loadingAI || !prompt}
          >
            <span className={styles.aiButtonIcon}>✨</span>
            <span className={styles.aiButtonText}>
              {loadingAI ? 'AI is thinking...' : 'Enhance with AI Magic'}
            </span>
            {loadingAI && <span className={styles.aiLoader}></span>}
          </button>

          {showAISuggestions && (
            <div className={styles.suggestionsContainer}>
              <div className={styles.suggestionsHeader}>
                <h3>AI-Enhanced Versions</h3>
                <button 
                  className={styles.closeSuggestions}
                  onClick={() => setShowAISuggestions(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.suggestionsGrid}>
                {aiSuggestions.map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className={`${styles.suggestionCard} ${selectedSuggestion === suggestion.id ? styles.selected : ''}`}
                    onClick={() => {
                      setSelectedSuggestion(suggestion.id);
                      setPrompt(suggestion.text);
                    }}
                  >
                    <div className={styles.suggestionHeader}>
                      <span className={styles.suggestionIcon}>{suggestion.icon}</span>
                      <span className={styles.suggestionType}>{suggestion.type}</span>
                    </div>
                    <p className={styles.suggestionText}>{suggestion.text}</p>
                    <div className={styles.suggestionTags}>
                      {suggestion.tags.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                    <div className={styles.useButton}>
                      {selectedSuggestion === suggestion.id ? '✓ Selected' : 'Use This'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        {/* Size Selection */}
        <div className={styles.selectionSection}>
          <h2>Choose Size</h2>
          <div className={styles.sizeGrid}>
            <div 
              className={`${styles.sizeOption} ${selectedSize === '1024x1024' ? styles.selected : ''}`}
              onClick={() => setSelectedSize('1024x1024')}
            >
              <div className={styles.sizePreview}>
                <div className={styles.sizeSquare}></div>
              </div>
              <h4>Square</h4>
              <p>1024 × 1024</p>
              <span className={styles.sizeUse}>Instagram, Profile</span>
            </div>
            
            <div 
              className={`${styles.sizeOption} ${selectedSize === '1024x1792' ? styles.selected : ''}`}
              onClick={() => setSelectedSize('1024x1792')}
            >
              <div className={styles.sizePreview}>
                <div className={styles.sizePortrait}></div>
              </div>
              <h4>Portrait</h4>
              <p>1024 × 1792</p>
              <span className={styles.sizeUse}>Stories, Mobile</span>
            </div>
            
            <div 
              className={`${styles.sizeOption} ${selectedSize === '1792x1024' ? styles.selected : ''}`}
              onClick={() => setSelectedSize('1792x1024')}
            >
              <div className={styles.sizePreview}>
                <div className={styles.sizeLandscape}></div>
              </div>
              <h4>Landscape</h4>
              <p>1792 × 1024</p>
              <span className={styles.sizeUse}>Banners, Headers</span>
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div className={styles.selectionSection}>
          <h2>Visual Style</h2>
          <div className={styles.styleGrid}>
            {[
              { id: 'professional', name: 'Professional', icon: '💼', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
              { id: 'creative', name: 'Creative', icon: '🎨', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
              { id: 'realistic', name: 'Realistic', icon: '📸', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
              { id: '3d', name: '3D Render', icon: '🎮', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
              { id: 'minimal', name: 'Minimal', icon: '⚪', gradient: 'linear-gradient(135deg, #e0e0e0, #eeeeee)' },
              { id: 'cartoon', name: 'Cartoon', icon: '🎭', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)' }
            ].map(style => (
              <div 
                key={style.id}
                className={`${styles.styleOption} ${selectedStyle === style.id ? styles.selected : ''}`}
                onClick={() => setSelectedStyle(style.id)}
              >
                <div 
                  className={styles.stylePreview}
                  style={{ background: style.gradient }}
                >
                  <span className={styles.styleIcon}>{style.icon}</span>
                </div>
                <span className={styles.styleName}>{style.name}</span>
              </div>
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