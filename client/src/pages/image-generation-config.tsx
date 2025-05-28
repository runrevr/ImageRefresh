
import React from 'react';
import { useLocation, useRoute } from 'wouter';
import ImageGenerationConfig from '@/components/ImageGenerationConfig';
import { GenerationConfig } from '@/components/ImageGenerationConfig';

interface LocationState {
  prompt?: string;
}

export default function ImageGenerationConfigPage() {
  const [location, navigate] = useLocation();
  const [match, params] = useRoute('/create-image');
  
  // Get the initial prompt from navigation state or URL params
  const state = (history?.state as LocationState) || {};
  const initialPrompt = state.prompt || new URLSearchParams(window.location.search).get('prompt') || '';

  const handleGenerate = (config: GenerationConfig) => {
    console.log('Generating with config:', config);
    
    // Here you can handle the generation logic
    // For example, navigate to a generation/processing page
    // or trigger your existing image generation flow
    
    // Example: Navigate to processing page with config
    navigate('/processing', { 
      state: { 
        generationConfig: config 
      } 
    });
  };

  const handleBack = () => {
    // Navigate back to the previous page or home
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ImageGenerationConfig
        initialPrompt={initialPrompt}
        onGenerate={handleGenerate}
        onBack={handleBack}
      />
    </div>
  );
}
