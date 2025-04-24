import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeftRight, Upload, ImageIcon, Edit } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';
import { downloadImage, getFilenameFromPath } from '@/lib/utils';
import { Link } from 'wouter';

interface ResultViewProps {
  originalImage: string;
  transformedImage: string;
  onTryAgain: () => void;
  onNewImage: () => void;
  onEditImage?: () => void;
  freeCredits: number;
  paidCredits: number;
  prompt?: string;
  canEdit?: boolean;
}

export default function ResultView({ 
  originalImage, 
  transformedImage, 
  onTryAgain, 
  onNewImage,
  onEditImage,
  freeCredits,
  paidCredits,
  prompt = "Transformation of the original image",
  canEdit = true
}: ResultViewProps) {
  const handleDownload = () => {
    downloadImage(transformedImage, getFilenameFromPath(transformedImage));
  };

  return (
    <div className="p-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Comparison slider */}
        <div className="w-full h-96 rounded-lg overflow-hidden mb-8">
          <ComparisonSlider 
            beforeImage={originalImage} 
            afterImage={transformedImage} 
          />
        </div>
        
        {/* Transformation Description - White text on black background */}
        <div className="bg-black p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <ImageIcon className="text-white h-5 w-5 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium mb-1">Transformation Description</h3>
              <p className="text-white text-sm md:text-base leading-relaxed">
                {prompt}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-xl font-medium mb-2">Transformation Complete!</p>
          <p className="text-gray-600">
            Drag the slider to compare before and after images.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {canEdit && onEditImage && (
            <Button
              className="text-white bg-black"
              onClick={onEditImage}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit This Image
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onTryAgain}
            className="text-red-500"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Try Another Prompt
          </Button>
          <Button 
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" /> Download Image
          </Button>
          <Button 
            variant="outline"
            className="border-primary-500 text-black hover:bg-primary-50 hover:text-primary-500 bg-primary-500"
            onClick={onNewImage}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Image
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-700">
            <span className="mr-1">⭐</span> 
            You have {freeCredits + paidCredits} free transformation{freeCredits + paidCredits !== 1 ? 's' : ''} remaining.
            {(freeCredits + paidCredits === 0) && (
              <Link href="/pricing">
                <span className="font-medium underline ml-1 cursor-pointer">
                  Get more credits
                </span>
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
