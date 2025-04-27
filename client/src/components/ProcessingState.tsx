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
              {/* Modern loading animation */}
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute w-full h-full rounded-xl bg-primary-500 opacity-70 animate-pulse"></div>
                <div className="absolute top-1 left-1 w-18 h-18 rounded-lg border-2 border-white animate-ping"></div>
                <div className="absolute inset-2 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary-500 to-blue-600 animate-pulse"></div>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">Processing your image</p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Drawing your imagination may take up to 60 seconds</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Our AI is working its magic on your image.
            <br />Please wait while we create your transformation.
          </p>
          <Button variant="outline" onClick={onCancel} className="text-white bg-black hover:bg-black/80">
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
