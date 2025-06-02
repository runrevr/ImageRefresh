
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpWithGoogle?: () => void;
  onSignUpWithEmail?: () => void;
  onLogin?: () => void;
}

export function SignUpModal({ 
  isOpen, 
  onClose, 
  onSignUpWithGoogle, 
  onSignUpWithEmail, 
  onLogin 
}: SignUpModalProps) {
  const handleSignUpWithGoogle = () => {
    onSignUpWithGoogle?.();
    // Redirect to Google auth
    window.location.href = '/auth?provider=google';
  };

  const handleSignUpWithEmail = () => {
    onSignUpWithEmail?.();
    // Redirect to email signup
    window.location.href = '/auth?mode=signup';
  };

  const handleLogin = () => {
    onLogin?.();
    // Redirect to login
    window.location.href = '/auth?mode=login';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Sparkles className="h-8 w-8 text-[#06B6D4] mx-auto mb-2" />
          </div>
          <DialogTitle className="text-xl font-bold text-[#00ff00]">
            🎉 Love What You Created?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-white mb-4 font-medium">
              Create a free account and get:
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-white">1 bonus credit</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-white">Save all your creations</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-white">Access to premium styles</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignUpWithGoogle}
              className="w-full bg-[#06B6D4] hover:bg-[#0891b2] text-white font-semibold py-3"
            >
              Sign Up with Google
            </Button>
            
            <Button
              onClick={handleSignUpWithEmail}
              variant="outline"
              className="w-full border-[#06B6D4] text-[#06B6D4] hover:bg-[#06B6D4] hover:text-white font-semibold py-3"
            >
              Sign Up with Email
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={handleLogin}
              className="text-white hover:text-[#06B6D4] font-medium underline"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
