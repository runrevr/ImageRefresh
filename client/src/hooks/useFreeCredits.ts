import { useState, useEffect } from 'react';
import { generateFingerprint } from '@/lib/fingerprint';

interface CreditStatus {
  hasCredits: boolean;
  totalCredits: number;
  creditsUsed: number;
  creditsRemaining: number;
  isGuest: boolean;
  shouldShowSignUpModal?: boolean;
}

export function useFreeCredits() {
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);

  const checkUserCredits = async (): Promise<CreditStatus> => {
    try {
      const fingerprint = await generateFingerprint();

      const response = await fetch('/api/check-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint }),
      });

      if (!response.ok) {
        throw new Error('Failed to check credits');
      }

      const credits = await response.json();

      // Check if this is a guest user who has used their free credit
      const shouldShowModal = credits.isGuest && credits.creditsUsed >= 1 && !credits.hasCredits;

      const statusWithModal = {
        ...credits,
        shouldShowSignUpModal: shouldShowModal
      };

      setCreditStatus(statusWithModal);
      return statusWithModal;
    } catch (error) {
      console.error('Error checking credits:', error);
      // Default to no credits on error
      const defaultStatus = {
        hasCredits: false,
        totalCredits: 0,
        creditsUsed: 1,
        creditsRemaining: 0,
        isGuest: true,
        shouldShowSignUpModal: true
      };
      setCreditStatus(defaultStatus);
      return defaultStatus;
    }
  };

  const useCredit = async (email?: string): Promise<void> => {
    try {
      const fingerprint = await generateFingerprint();

      const response = await fetch('/api/use-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fingerprint,
          email: email || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to use credit');
      }

      // Refresh credit status after using a credit
      await checkUserCredits();
    } catch (error) {
      console.error('Error using credit:', error);
      throw error;
    }
  };

  const markModalShown = () => {
    if (creditStatus) {
      setCreditStatus({
        ...creditStatus,
        shouldShowSignUpModal: false
      });
    }
  };

  const isAuthenticated = creditStatus && !creditStatus.isGuest;

  return {
    creditStatus,
    checkUserCredits,
    useCredit,
    markModalShown,
    isAuthenticated
  };
}