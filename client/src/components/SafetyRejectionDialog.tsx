
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

interface SafetyRejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
}

export default function SafetyRejectionDialog({ 
  isOpen, 
  onClose, 
  errorMessage 
}: SafetyRejectionDialogProps) {
  
  const isSafetyRejection = errorMessage?.includes('safety system') || 
                           errorMessage?.includes('content policy') ||
                           errorMessage?.includes('inappropriate content');

  const isChildContentRejection = errorMessage?.includes('safety system') && 
                                 (errorMessage?.includes('baby') || 
                                  errorMessage?.includes('child') || 
                                  errorMessage?.includes('minor'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Content Policy Violation
          </DialogTitle>
          <DialogDescription className="text-left space-y-3">
            <p>
              {isSafetyRejection 
                ? "Your image transformation request was rejected by our AI safety system."
                : "Unable to process your image transformation request."
              }
            </p>
            
            {isChildContentRejection && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Images with children require special care</p>
                    <p>Our AI system is extra protective of content involving minors to ensure their safety and dignity.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-medium">Common reasons for rejection:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Inappropriate content involving children/minors</li>
                <li>• References to violence, weapons, or dangerous activities</li>
                <li>• Adult themes applied to child images</li>
                <li>• Controversial figures or inappropriate transformations</li>
                <li>• Content that could be harmful or offensive</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Try these alternatives instead:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Cartoon or animated characters (Disney, Pixar)</li>
                    <li>• Fantasy themes (unicorns, dragons, fairy tales)</li>
                    <li>• Animals or nature scenes</li>
                    <li>• Superhero costumes (without violent elements)</li>
                    <li>• Historical figures (without controversial aspects)</li>
                  </ul>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
