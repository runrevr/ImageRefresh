import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { apiRequest } from '@/lib/queryClient'

// Existing UserCredits type from your system
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
}

interface CreditCheckResult {
  hasCredits: boolean
  creditsRemaining: number
  requiresEmail: boolean
  creditType: 'free' | 'paid' | 'none'
  totalCredits: number
}

export function useFreeCredits() {
  const { user } = useAuth()
  const [guestEmail, setGuestEmail] = useState<string | null>(null)

  useEffect(() => {
    // Load guest email from localStorage for non-authenticated users
    if (!user) {
      const savedEmail = localStorage.getItem('guestEmail')
      setGuestEmail(savedEmail)
    }
  }, [user])

  const checkUserCredits = async (): Promise<CreditCheckResult> => {
    if (user) {
      // For authenticated users, use existing credit system
      try {
        const response = await apiRequest("GET", `/api/credits/${user.id}`)
        const data = await response.json()
        
        const freeAvailable = !data.freeCreditsUsed ? 1 : 0
        const paidAvailable = data.paidCredits || 0
        const totalCredits = freeAvailable + paidAvailable
        
        return {
          hasCredits: totalCredits > 0,
          creditsRemaining: totalCredits,
          requiresEmail: false,
          creditType: freeAvailable > 0 ? 'free' : paidAvailable > 0 ? 'paid' : 'none',
          totalCredits
        }
      } catch (error) {
        console.error('Error checking user credits:', error)
        return {
          hasCredits: false,
          creditsRemaining: 0,
          requiresEmail: false,
          creditType: 'none',
          totalCredits: 0
        }
      }
    } else {
      // For non-authenticated users, check localStorage free credit
      const guestFreeUsed = localStorage.getItem('guestFreeUsed') === 'true'
      const hasGuestEmail = !!localStorage.getItem('guestEmail')
      
      return {
        hasCredits: !guestFreeUsed,
        creditsRemaining: guestFreeUsed ? 0 : 1,
        requiresEmail: !hasGuestEmail,
        creditType: guestFreeUsed ? 'none' : 'free',
        totalCredits: guestFreeUsed ? 0 : 1
      }
    }
  }

  const useCredit = async (email?: string): Promise<void> => {
    if (user) {
      // For authenticated users, use existing credit deduction API
      try {
        const response = await apiRequest("POST", `/api/use-credit/${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to deduct credit')
        }
      } catch (error) {
        console.error('Error using credit:', error)
        throw error
      }
    } else {
      // For guest users, mark free credit as used and save email
      localStorage.setItem('guestFreeUsed', 'true')
      if (email) {
        localStorage.setItem('guestEmail', email)
        setGuestEmail(email)
        
        // Optionally create a guest user account with the email
        try {
          await apiRequest("POST", "/api/guest-signup", { 
            email,
            source: 'free_trial'
          })
        } catch (error) {
          console.error('Error creating guest account:', error)
          // Don't throw here - we still want to process the image
        }
      }
    }
  }

  const resetGuestCredits = () => {
    // Only reset guest credits (for development/testing)
    localStorage.removeItem('guestFreeUsed')
    localStorage.removeItem('guestEmail')
    setGuestEmail(null)
  }

  return {
    checkUserCredits,
    useCredit,
    resetGuestCredits,
    guestEmail,
    isAuthenticated: !!user
  }
}