import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Zap, Palette, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import styles from './ImageGenerationConfig.module.css';

interface ImageGenerationConfigProps {
  initialPrompt?: string;
  onGenerate: (config: GenerationConfig) => void;
  onBack?: () => void;
}

export interface GenerationConfig {
  prompt: string;
  size: string;
  style: string;
}

const ImageGenerationConfig: React.FC<ImageGenerationConfigProps> = ({ 
  initialPrompt = '', 
  onGenerate,
  onBack 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const sizeOptions = [
    { value: '1024x1024', label: 'Square (1:1)', description: 'Perfect for social media posts' },
    { value: '1792x1024', label: 'Landscape (16:9)', description: 'Great for presentations' },
    { value: '1024x1792', label: 'Portrait (9:16)', description: 'Ideal for mobile screens' }
  ];

  const styleOptions = [
    { value: 'professional', label: 'Professional', description: 'Clean, business-ready visuals' },
    { value: 'creative', label: 'Creative', description: 'Artistic and expressive' },
    { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
    { value: 'vibrant', label: 'Vibrant', description: 'Bold colors and energy' }
  ];

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.header}>
        {onBack && (
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft className={styles.backIcon} />
            Back
          </button>
        )}
        <h1>Perfect Your Vision</h1>
        <p>Fine-tune your idea with AI assistance and professional options</p>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressStep}>1. Describe</div>
        <div className={`${styles.progressStep} ${styles.active}`}>2. Customize</div>
        <div className={styles.progressStep}>3. Generate</div>
      </div>

      <div className={styles.mainCard}>
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

        <div className={styles.aiSection}>
          <div className={styles.aiHeader}>
            <Sparkles className={styles.aiIcon} />
            <h3>AI Enhancement</h3>
          </div>
          <button className={styles.aiButton}>
            <span>✨ Enhance with AI</span>
          </button>
        </div>

        <div className={styles.optionsGrid}>
          <div className={styles.optionGroup}>
            <h3>
              <ImageIcon className={styles.sectionIcon} />
              Size & Format
            </h3>
            <div className={styles.sizeOptions}>
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.sizeOption} ${selectedSize === option.value ? styles.selected : ''}`}
                  onClick={() => setSelectedSize(option.value)}
                >
                  <div className={styles.sizeOptionContent}>
                    <span className={styles.sizeLabel}>{option.label}</span>
                    <span className={styles.sizeDescription}>{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.optionGroup}>
            <h3>
              <Palette className={styles.sectionIcon} />
              Style & Mood
            </h3>
            <div className={styles.styleOptions}>
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.styleOption} ${selectedStyle === option.value ? styles.selected : ''}`}
                  onClick={() => setSelectedStyle(option.value)}
                >
                  <div className={styles.styleOptionContent}>
                    <span className={styles.styleLabel}>{option.label}</span>
                    <span className={styles.sizeDescription}>{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.quickOptions}>
          <label className={styles.quickOption}>
            <input type="checkbox" />
            <span>Remove Background</span>
          </label>
          <label className={styles.quickOption}>
            <input type="checkbox" />
            <span>High Resolution (4K)</span>
          </label>
          <label className={styles.quickOption}>
            <input type="checkbox" />
            <span>Commercial License</span>
          </label>
        </div>

        <div className={styles.generateSection}>
          <button 
            className={styles.generateButton}
            onClick={() => onGenerate({
              prompt,
              size: selectedSize,
              style: selectedStyle
            })}
          >
            <Zap className={styles.generateIcon} />
            <span>Generate My Image</span>
          </button>
          <p className={styles.generateHint}>Takes about 10-15 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationConfig;