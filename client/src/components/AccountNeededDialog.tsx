import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface AccountNeededDialogProps {
  open: boolean;
  onClose: () => void;
  email?: string | null;
  isLoggedIn?: boolean;
  remainingCredits?: number;
}

export default function AccountNeededDialog({
  open,
  onClose,
  email,
  isLoggedIn = false,
  remainingCredits = 0
}: AccountNeededDialogProps) {
  const [_, navigate] = useLocation();
  
  if (!open) return null;
  
  const handleCreateAccount = () => {
    navigate('/auth');
  };

  const handleGoToBilling = () => {
    navigate('/account');
  };
  
  // If user is logged in, show "Purchase Credits" dialog
  if (isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="bg-gradient-to-br from-[#2A7B9B] to-[#1e5a73] px-8 pt-12 pb-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Credits Required</h3>
            <p className="text-white/90">
              You currently have {remainingCredits} credits remaining.
            </p>
          </div>
          <div className="p-8">
            <p className="text-gray-700 mb-6 text-center">
              To continue creating more amazing transformations, you'll need to purchase additional credits.
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleGoToBilling}
                className="bg-[#2A7B9B] hover:bg-[#1e5a73] text-white py-4 text-base font-semibold"
              >
                Purchase Credits
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="py-4 text-base"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default: Show "Create Account" dialog for non-logged in users
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-br from-[#2A7B9B] to-[#1e5a73] px-8 pt-12 pb-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Account Required</h3>
          <p className="text-white/90">
            Thanks for using ImageRefresh!
          </p>
        </div>
        <div className="p-8">
          <p className="text-gray-700 mb-6 text-center">
            To continue creating more amazing transformations, you'll need to create a free account.
            {email && (
              <span className="block mt-2">
                We've saved your email (<span className="font-medium">{email}</span>) to make
                signing up easier.
              </span>
            )}
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleCreateAccount}
              className="bg-[#2A7B9B] hover:bg-[#1e5a73] text-white py-4 text-base font-semibold"
            >
              Create Free Account
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="py-4 text-base"
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}