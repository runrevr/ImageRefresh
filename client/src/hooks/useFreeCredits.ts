import { useState, useEffect } from 'react'

interface FreeCreditsState {
  available: number
  used: number
  userEmail: string | null
  hasUsedFree: boolean
}

export function useFreeCredits() {
  const [credits, setCredits] = useState<FreeCreditsState>({
    available: 1,
    used: 0,
    userEmail: null,
    hasUsedFree: false
  })

  useEffect(() => {
    // Load credit state from localStorage
    const freeCreditsUsed = parseInt(localStorage.getItem('freeCreditsUsed') || '0')
    const userEmail = localStorage.getItem('userEmail')
    const hasUsedFree = freeCreditsUsed >= 1

    setCredits({
      available: hasUsedFree ? 0 : 1,
      used: freeCreditsUsed,
      userEmail,
      hasUsedFree
    })
  }, [])

  const checkFreeCredit = (): boolean => {
    if (credits.hasUsedFree) {
      return false
    }
    return credits.available > 0
  }

  const useFreeCredit = (email?: string) => {
    const newUsed = credits.used + 1
    localStorage.setItem('freeCreditsUsed', newUsed.toString())
    
    if (email) {
      localStorage.setItem('userEmail', email)
    }

    setCredits(prev => ({
      ...prev,
      available: 0,
      used: newUsed,
      userEmail: email || prev.userEmail,
      hasUsedFree: true
    }))
  }

  const resetCredits = () => {
    localStorage.removeItem('freeCreditsUsed')
    localStorage.removeItem('userEmail')
    setCredits({
      available: 1,
      used: 0,
      userEmail: null,
      hasUsedFree: false
    })
  }

  return {
    credits,
    checkFreeCredit,
    useFreeCredit,
    resetCredits
  }
}