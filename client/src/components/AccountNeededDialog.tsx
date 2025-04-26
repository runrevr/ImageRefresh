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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Credits Required</h3>
            <p className="text-gray-700 mb-6">
              You currently have {remainingCredits} credits remaining.
              To continue creating more amazing transformations, you'll need to purchase additional credits.
            </p>
            
            <div className="flex justify-between space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Not Now
              </Button>
              <Button 
                onClick={handleGoToBilling}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Purchase Credits
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default: Show "Create Account" dialog for non-logged in users
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">Account Required</h3>
          <p className="text-gray-700 mb-6">
            Thanks for using ImageRefresh! To continue creating more amazing transformations,
            you'll need to create a free account.
            {email && (
              <span className="block mt-2">
                We've saved your email (<span className="font-medium">{email}</span>) to make
                signing up easier.
              </span>
            )}
          </p>
          
          <div className="flex justify-between space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Not Now
            </Button>
            <Button 
              onClick={handleCreateAccount}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}