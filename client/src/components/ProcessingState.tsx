import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProcessingStateProps {
  originalImage: string;
  onCancel: () => void;
}

export default function ProcessingState({ originalImage, onCancel }: ProcessingStateProps) {
  return (
    <div className="p-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-80 md:h-96">
            <img 
              id="processing-original" 
              className="max-w-full max-h-full object-contain" 
              alt="Your uploaded image" 
              src={originalImage} 
            />
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center h-80 md:h-96">
            <div className="animate-pulse-slow bg-gray-200 rounded-lg w-full h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-gray-700 mb-2">Processing your image</p>
              <div className="loading-dots text-xl text-primary-500 flex">
                <span className="animate-bounce mx-0.5">.</span>
                <span className="animate-bounce mx-0.5 animation-delay-200">.</span>
                <span className="animate-bounce mx-0.5 animation-delay-400">.</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">This may take up to 30 seconds</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Our AI is working its magic on your image.
            <br />Please wait while we create your transformation.
          </p>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
