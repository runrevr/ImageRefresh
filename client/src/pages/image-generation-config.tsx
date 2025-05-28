import React from 'react';
import { useLocation, useRoute } from 'wouter';
import ImageGenerationConfig from '../components/ImageGenerationConfig';

const ImageGenerationConfigPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/create-image');

  // Get the prompt from session storage
  const initialPrompt = sessionStorage.getItem('imagePrompt') || "";
  
  console.log('ImageGenerationConfigPage rendered with prompt:', initialPrompt);

  const handleGenerate = (config: any) => {
    console.log('Generating with config:', config);
    // Add your generation logic here
    // Then navigate to results page
    // setLocation('/generation-results');
  };

  const handleBack = () => {
    setLocation('/text-to-image');
  };

  return (
    <ImageGenerationConfig
      initialPrompt={initialPrompt}
      onGenerate={handleGenerate}
      onBack={handleBack}
    />
  );
};

export default ImageGenerationConfigPage;