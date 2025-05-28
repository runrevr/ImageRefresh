
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function TextToImageInputPage() {
  const [location, navigate] = useLocation();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log('Current location before navigation:', location);
      console.log('Storing prompt:', inputValue);
      
      try {
        // Store the prompt in session storage
        sessionStorage.setItem('imagePrompt', inputValue);
        console.log('Prompt stored successfully');
        
        console.log('About to navigate to /create-image');
        // Navigate to the configuration page
        navigate('/create-image');
        
        // Check if navigation worked
        setTimeout(() => {
          console.log('Location after navigation attempt:', window.location.pathname);
          console.log('Current route in browser:', window.location.href);
        }, 100);
      } catch (error) {
        console.error('Error during navigation:', error);
      }
    } else {
      console.log('Input is empty, not navigating');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Describe Your Perfect Image
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Tell us what you want to create and we'll help you perfect it
        </p>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the image you want to create..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="min-h-[120px] text-base"
          />
          
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg"
          >
            Let's Make Some Magic ✨
          </Button>
        </div>
      </div>
    </div>
  );
}
