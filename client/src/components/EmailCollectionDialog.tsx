import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EmailCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onEmailSubmitted: () => void;
  userId: number;
}

const EmailCollectionDialog = ({
  open,
  onClose,
  onEmailSubmitted,
  userId
}: EmailCollectionDialogProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  if (!open) return null;
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/update-email', {
        userId,
        email
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your email has been saved. Enjoy your image!",
        });
        onEmailSubmitted();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error saving email:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-white">Almost there!</h3>
          <p className="text-gray-300 mb-4">
            Enter your email to see your transformed image. We'll only use it to update
            you on new features and special offers.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
              {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-600 text-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Show My Image"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailCollectionDialog;
