import React from 'react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';

interface EditConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paidCredits: number;
}

const EditConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  paidCredits
}: EditConfirmDialogProps) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Additional Edit Will Use A New Credit</h3>
          <p className="text-gray-600 mb-4">
            Each credit includes 1 transformation and 1 edit. You've already used the free edit for this image.
            Making another edit will use 1 additional credit from your account.
            You currently have {paidCredits} credits remaining.
          </p>
          <p className="text-gray-600 mb-6">
            Do you want to proceed with this edit?
          </p>
          
          <div className="flex justify-end space-x-3">
            <RainbowButton 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </RainbowButton>
            <RainbowButton 
              type="button" 
              onClick={onConfirm}
            >
              Yes, Use 1 Credit
            </RainbowButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditConfirmDialog;
